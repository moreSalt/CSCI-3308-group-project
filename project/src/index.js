const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
// const axios = require('axios'); // To make HTTP requests from our server.
const MarvelAPI = require("./api/comics.js")
// database configuration
const dbConfig = {
    host: 'db', // the database server
    port: 5432, // the database port
    database: process.env.POSTGRES_DB, // the database name
    user: process.env.POSTGRES_USER, // the user account to connect with
    password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
})
.catch(error => {
    console.log('ERROR:', error.message || error);
});

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );
  
  
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
);

app.use(function(req, res, next) {
    res.locals.user = req.session.user;
    res.locals.meta = {
        path: req.path
    }
    next();
  });

const api = new MarvelAPI(process.env.MARVEL_API_KEY)
// ********************
// ROUTES
// ********************


// DEFAULT
app.get("/", async function(req, res) {
    res.render("pages/home");
})

// REGISTER
app.get("/register", async function(req, res) {
    res.render("pages/register");
})
app.post("/register", async function(req, res) {
      try {
            const username = req.body.username;
            if (typeof(username) !== 'string' || username.length < 4) {
                throw new Error("username must be a string with 4+ characters")
            }

            if (typeof(req.body.password) !== 'string' || req.body.password < 8) {
                throw new Error("password must be a string with 8+ characters")
            }

            const query1 = "select * from users where users.username = $1;";
            const user = await db.oneOrNone(query1, username);
            if (user) {
                throw new Error("Username taken")
            }

            if (!req.body.username || !req.body.password) {
                throw new Error("Please input both username and password")
            }

          const hash = await bcrypt.hash(req.body.password, 10)
          const query = await db.one("INSERT INTO users(username, password) VALUES ($1, $2) returning * ;", [
              req.body.username,
              hash
          ])
          return await res.redirect("/login")
      } catch (error) {
            console.log(error)
         return await res.status(401).render("pages/register",{
              error: true,
              message: error
          })
      }
})

// LOGIN
app.get("/login", async function(req, res) {
    res.render("pages/login");
})

// var currentUser = "name";

app.post("/login", async function(req, res) {
    try {
        // currentUser = req.body.username;
        const user = await db.oneOrNone("SELECT * FROM users WHERE username = $1 ;", [
            req.body.username
        ])
        //additional user info message implementations
        if (!req.body.username || !req.body.password) {
            throw new Error("Please input both username and password")
        }
        if (!user) {
            throw new Error("User not found")
        }
        //
        const match = await bcrypt.compare(req.body.password, user.password);
        if (match) {
            console.log("in")
            req.session.user = user;
            req.session.save()
            res.redirect("/home")
        } else {
            throw new Error("Invalid username/password")
        }
    } catch (error) {
        console.log(error)
       await res.status(401).render("pages/login",{
            error: true,
            message: error
        })
    }
}) 

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

  // Authentication Middleware. // placed after login, welcome, register, etc. pages that you should be able to get while not logged in
const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to login page.
      return res.redirect('/login');
    }
    next();
  };
  
// Authentication Required
app.use(auth);

  
// HOME
app.get("/home", async function(req, res) {
    // if (req.session.user) {
    //     // Render the home page if the user is logged in
    //     res.render("pages/home", { user: req.session.user });
    // } else {
    //     // Redirect to login if the user is not logged in
    //     res.redirect("/login");
    // }                                //the authentication middleware made this redundant
    const reviews = await db.any("SELECT r.review, r.rating,c.comic_name,r.username, r.title FROM comics c INNER JOIN review_comics rc ON c.comic_id = rc.comic_id INNER JOIN reviews r ON rc.review_id = r.id")
    res.render("pages/home", { user: req.session.user,reviews});
});

app.post("/search", async function(req, res) {
    try{
    if (req.body.searchQuery < 1) {
        throw new Error("Please enter a positive comic ID")
    }

    const text1 = "/comics/";
    const entry = text1.concat(req.body.searchQuery);
    return await res.redirect(entry);

    }catch (error) {
        console.log(error)
        await res.render("pages/home",{
            error: true,
            message: error
        })
    }
});


// Find comics and also search for comics
app.get("/discover", async function(req, res) {
    const queries = []
    try {
        const keys = Object.keys(req.query)
        for (let i =0; i < keys.length; i++) {
            const key = keys[i]
            const value = req.query[key]

            if (!value) continue;

            queries.push({
                key: key,
                value: value
            })

        }

        if (!queries.length) queries.push({ key: "startYear", value: Math.floor(Math.random() * (2023 - 1990 + 1) + 1990) })
        const data = await api.searchSeries(queries)

        await res.render("pages/discover", { data: data, search: queries  });

    } catch (error) {
            await console.log("/discover error:", error)
            await res.render("pages/discover", { error: true, message: error, data: [], search: queries   })
    }

});

// ACCOUNT: change profile picture, username or password
app.get("/account", async function(req, res) {
    // Perform any necessary operations, like fetching user data
    // For example, if you have user data in req.user or similar, you can pass it to your EJS template

    // Assuming you have user data, it could look something like this:
    // const userData = await getUserData(req.user);

    // Now, render the account.ejs page, potentially passing in any user data
    res.render("pages/account", { 
        user: req.session.user 
         // userData: userData
        // You can pass any additional data your EJS page might need here
    });
});

// Middleware to protect the routes and ensure user is authenticated
const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// Change Username
app.post('/change-username', isAuthenticated, async (req, res) => {
    const newUsername = req.body.newUsername.trim();
    const oldUsername = req.session.user.username; // Use the username from the session

    try {
        if (typeof(newUsername) !== 'string' || newUsername.length < 4) {
            throw new Error("Username must be a string with 4+ characters.");
        }

        // Check if new username is taken
        const userCheck = await db.oneOrNone('SELECT username FROM users WHERE username = $1', newUsername);
        if (userCheck) {
            throw new Error("Username is already taken.");
        }

        // Begin transaction to update username
        await db.tx(async t => {
            // Update reviews table first to maintain foreign key relationship
            await t.none('UPDATE reviews SET username = $1 WHERE username = $2', [newUsername, oldUsername]);

            // Update groups table if username is used there
            await t.none('UPDATE groups SET username = $1 WHERE username = $2', [newUsername, oldUsername]);

            // Update users table
            await t.none('UPDATE users SET username = $1 WHERE username = $2', [newUsername, oldUsername]);
        });

        // Update the session with the new username
        req.session.user.username = newUsername;
        req.session.save();

        res.redirect('/account');
    } catch (error) {
        console.error(error);
        res.render('pages/account', { error: true, message: error.message });
    }
});

// Change Password
app.post('/change-password', isAuthenticated, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const username = req.session.user.username; // Use username instead of id

    try {
        if (typeof(newPassword) !== 'string' || newPassword.length < 8) {
            throw new Error("New password must be a string with 8+ characters.");
        }

        // Fetch the user's current hashed password from the database
        const user = await db.one('SELECT password FROM users WHERE username = $1', username);

        // Verify the current password
        const match = await bcrypt.compare(currentPassword, user.password);
        if (!match) {
            throw new Error("Current password is incorrect.");
        }

        // Hash the new password
        const hash = await bcrypt.hash(newPassword, 10);

        // Update the password in the database using the username
        await db.none('UPDATE users SET password = $1 WHERE username = $2', [hash, username]);

        res.redirect('/account');
    } catch (error) {
        console.error(error);
        res.render('pages/account', { error: true, message: error.message });
    }
});

// FEED: feed of latest reviews from anywhere
// marvel-api: just needed for title and image, the rest is pulled from db
// methods: get

// COMICS: search for a specific comic
// marvel-api: title, image, and the search itself
// methods: GET

// COMIC: look at reviews of a specific comic
// marvel-api: title, image, the rest from the db
// methods: GET, POST
app.get("/comics/:id", async (req, res) => {
    try {
        const data = await api.specificComic(parseInt(req.params.id))
        if (!data) {
            throw new Error("marvel api did not return any data")
        }
        

        const reviews = await db.any("SELECT r.review, r.rating,c.comic_name,r.username, r.title FROM comics c INNER JOIN review_comics rc ON c.comic_id = rc.comic_id INNER JOIN reviews r ON rc.review_id = r.id  WHERE rc.comic_id = $1 ;", [
            parseInt(req.params.id)
        ])

        await console.log(reviews)
        await res.render("pages/comic", {
            data: data,
            reviews: reviews,
            // message: "this is an example message, you can remove it or add error: true if you want it to be color red"
        })
    } catch (error) {
        console.log(error)
        await res.render("/",{
             error: true,
             message: error
         })
    }
})

app.post("/comics/:id", async (req, res) => {
    try {
        const data = await api.specificComic(parseInt(req.params.id))
        if (!data) {
            throw new Error("Marvel api did not return any data")
        }



        const user = req.session.user
        if (!user || !user.username) throw new Error("Login required to post a review")


        const {review, rating,title} =  req.body //added title to review
        if (review.length > 256) throw new Error("Review must be less than 256 characters")
        if (rating < 0 || rating > 5) throw new Error("Rating must be between 0 and 5")

        const checkIfAlreadyReviewed = await db.any("SELECT r.review, r.rating,c.comic_name,r.username, r.title FROM comics c INNER JOIN review_comics rc ON c.comic_id = rc.comic_id INNER JOIN reviews r ON rc.review_id = r.id WHERE rc.comic_id = $1 and r.username = $2", [
            parseInt(req.params.id),
            user.username
        ])

        if (checkIfAlreadyReviewed.length > 0) throw new Error("Only 1 review per comic per user is allowed")
 //removed the comic id due to table change 
        let reviews = await db.any("INSERT INTO reviews(review, rating, username,title) VALUES ($1, $2, $3, $4) returning * ;", [
            //parseInt(req.params.id), not using the comic id anymore
            review,
            rating,
            user.username,
            title
        ])
        //command for new table comics 
        await db.any("INSERT INTO comics(comic_id, comic_name) VALUES ($1, $2) ON CONFLICT DO NOTHING;", [ //when conflict occures it just skips it 
            parseInt(req.params.id),
            data.title
            
        ])
        await db.any("INSERT INTO review_comics(review_id, comic_id) VALUES ($1, $2) ;", [ //when conflict occures it just skips it 
            reviews[0].id,
            parseInt(req.params.id)
            
            
        ])

        await res.redirect(`/comics/${req.params.id}`)

        // INSERT INTO reviews(comic_id, review, rating, username) VALUES (502, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit', 3, 'admin');


    } catch (error) {
        console.log("Error posting review:", error)
        await res.render("pages/home", {
            error: true,
            message: error
        })
    }
})

app.get("/comics/:id/:review_id/delete", async (req, res) => {

    try {
        const user = req.session.user
        if (!user || !user.username) throw new Error("Login required to post a review")
        
        const data = await api.specificComic(parseInt(req.params.id))
        if (!data) {
            throw new Error("marvel api did not return any data")
        }
    
        const review = await db.any("SELECT * from reviews WHERE id = $1", [
            parseInt(req.params.review_id),
        ])
    
        if (review.length === 0) throw new Error("Could not find any reviews with that id")

        if (review[0].username !== user.username) throw new Error("You cannot delete someone elses review")
    
        const reviews = await db.any("DELETE from reviews WHERE id = $1 returning *;", [
            parseInt(req.params.review_id),
        ])
        await res.redirect(`/comics/${req.params.id}`)
        // await res.render("pages/comic", {
        //     data: data,
        //     reviews: reviews,
        //     message: "Deleted your review"
        // })
    } catch (error) {
        console.log("Error deleting review:", error)
        await res.render("pages/home", {
            error: true,
            message: error
        })
    }
})

// Fetch a series based on series_id
app.get("/series/:id", async (req, res) => {
    try {

        // Fetch data
        const data = await api.specificSeries(parseInt(req.params.id))

        // Check to make sure there is data
        if (!data) {
            throw new Error("marvel api did not return any data")
        }

        // Render page
        await res.render("pages/series", {
            data: data,
        })
    } catch (error) {
        await console.log("series/:id error:",error)
        await res.render("pages/series",{
             error: true,
             message: error
         })
    }
})

// Route handler to get all groups
app.get("/groups", async (req, res) => {
    try {
        // Query the database to get all groups
        const groups = await db.any("SELECT * FROM groups;");
        // Render the groups page with the list of groups
        await res.render('pages/groups', {
            groups: groups
        });
    } catch (error) {
        // Log and handle any errors
        await console.log("Error in groups", error);
        // Render the groups page with an error message
        await res.render("pages/groups", {
            groups: [],
            error: true,
            message: error
        });
    }
});

// Route handler to create a new group
app.post("/groups", async (req, res) => {
    try {
        // Validate the group name using a regular expression
        let regex = new RegExp("^[A-Za-z0-9_-]*$");
        const validName = regex.test(req.body.name);
        if (!validName) throw new Error("Names must be alphanumeric or -, _. No spaces or characters");

        // Check if the user is logged in
        if (!req.session.user || !req.session.user.username) throw new Error("Must be logged in to do that");

        // Validate the length of the group name and about description
        if (req.body.name.length > 32 || !req.body.name || !req.body.about || req.body.about.length > 256)
            throw new Error("Invalid about or name");

        // Insert the new group into the database
        const data = [req.body.name, req.body.about, req.session.user.username];
        const group = await db.one("INSERT INTO groups(id, about, username) VALUES ($1, $2, $3) returning *;", data);

        // Redirect to the groups page
        await res.redirect("/groups");
    } catch (error) {
        // Log and handle errors
        await console.log("Error in groups", error);
        // Render the groups page with an error message
        await res.render("pages/groups", {
            groups: [],
            error: true,
            message: error
        });
    }
});

// Route handler to view a specific group and its messages
app.get("/groups/:id", async (req, res) => {
    try {
        // Retrieve all messages for the specified group
        const messages = await db.any("SELECT * FROM messages WHERE group_id = $1;", [req.params.id]);

        // Retrieve the specified group's details
        const group = await db.oneOrNone("SELECT * FROM groups WHERE id = $1;", [req.params.id]);

        // Render the group page with its messages and details
        await res.render('pages/group', {
            messages: messages,
            group: group
        });
    } catch (error) {
        // Log and handle errors
        await console.log("Error in groups", error);
        // Render the group page with an error message
        await res.render("pages/group", {
            messages: [],
            group: null,
            error: true,
            message: error
        });
    }
});

// Route handler to post a message in a group
app.post("/groups/:id/messages", async (req, res) => {
    try {
        // Validate the message and group ID
        if (!req.params.id || !req.body.content) throw new Error("Invalid message");

        // Insert the new message into the database
        const data = [req.body.content, req.session.user.username, req.params.id];
        const message = await db.any("INSERT INTO messages(content, username, group_id) VALUES ($1, $2, $3) returning *;", data);

        // Redirect back to the group page
        await res.redirect("/groups/" + req.params.id);
    } catch (error) {
        // Log and handle errors
        await console.log("Error submitting message", error);
        await res.redirect("/groups/" + req.params.id);
    }
});

// Route handler to delete a message from a group
app.post("/groups/:id/messages/delete", async (req, res) => {
    try {
        // Retrieve the message to be deleted
        const message = await db.any("SELECT * from messages WHERE id = $1;", [parseInt(req.body.messageId)]);

        // Verify the message exists
        if (!message.length) throw new Error("Message id does not exist");

        // Verify the group ID is valid
        const group = await db.any("SELECT * from groups WHERE id = $1;", [req.params.id]);
        if (!group.length) throw new Error("Message does not contain a valid group id");

        // Check if the user is authorized to delete the message
        if (message[0].username !== req.session.user.username && req.session.user.username !== group[0].username)
            throw new Error("You can't delete another user's message");

        // Delete the message from the database
        const query = await db.any("DELETE from messages WHERE id = $1 returning *;", [parseInt(req.body.messageId)]);

        // Redirect back to the group page
        await res.redirect("/groups/" + req.params.id);
    } catch (error) {
        // Log and handle errors
        await console.log("Error deleting message", error);
        await res.redirect("/groups/" + req.params.id);
    }
});


// Create a user logout that sends a message to confirm the user for a logout session.
app.get("/logout", async function(req, res) {
    try {
      await req.session.destroy()

      return await res.render("pages/login", {
        error: false,
        message: "Logged out Successfully",
        user: null
      })
  
    } catch (error) {
       await res.render("pages/login",{
            error: true,
            message: error,
        })
    }
  })


module.exports = app.listen(3000);

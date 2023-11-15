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

const api = new MarvelAPI(process.env.MARVEL_API_KEY)
// ********************
// ROUTES
// ********************


// DEFAULT
app.get("/", async function(req, res) {
    res.render("pages/login");
})

// HOME
app.get("/home", async function(req, res) {
    if (req.session.user) {
        // Render the home page if the user is logged in
        res.render("pages/home", { user: req.session.user });
    } else {
        // Redirect to login if the user is not logged in
        res.redirect("/login");
    }
});

// REGISTER
app.get("/register", async function(req, res) {
    res.render("pages/register");
})
app.post("/register", async function(req, res) {
      try {
          const hash = await bcrypt.hash(req.body.password, 10)
          const query = await db.one("INSERT INTO users(username, password) VALUES ($1, $2) returning * ;", [
              req.body.username,
              hash
          ])
          return await res.redirect("/login")
      } catch (error) {
         return await res.render("pages/register",{
              error: true,
              message: error
          })
      }
})

// LOGIN
app.get("/login", async function(req, res) {
    res.render("pages/login");
})

app.post("/login", async function(req, res) {
    try {
        const user = await db.one("SELECT * FROM users WHERE username = $1 ;", [
            req.body.username
        ])
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
       await res.render("pages/login",{
            error: true,
            message: error
        })
    }
})

app.get('/welcome', (req, res) => {
    res.json({status: 'success', message: 'Welcome!'});
  });

// ACCOUNT: look at your past reviews and maybe things like add a pfp


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
        await res.render("pages/comic", {
            data: data,
            reviews: [
                {
                    title: "Example review",
                    description: "Sed fugit fugiat voluptatem et adipisci et aspernatur. Vero reprehenderit sint officia mollitia dolore in debitis. Consequatur laudantium totam ad rem commodi. Error maxime inventore unde omnis odio laboriosam. Quos dignissimos quas ad ut tenetur dolo"
                }
            ],
            message: "wow"
        })
    } catch (error) {
        await res.render("pages/login",{
            error: true,
            message: error,
            results: []
        })
    }
})

// Create a user logout that sends a message to confirm the user for a logout session.
app.get("/logout", async function(req, res) {
    try {
      await req.session.destroy()
      return await res.render("pages/login", {
        error: false,
        message: "Logged out Successfully"
      })
  
    } catch (error) {
       await res.render("pages/login",{
            error: true,
            message: error,
        })
    }
  })
module.exports = app.listen(3000);
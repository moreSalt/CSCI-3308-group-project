const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
// const axios = require('axios'); // To make HTTP requests from our server.

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

// ********************
// ROUTES
// ********************

// HOME
app.get("/", async function(req, res) {
    res.render("pages/login")
})


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
            req.session.user = user;
            req.session.save()
            res.redirect("/feed")
        } else {
            throw new Error("Invalid username/password")
        }
    } catch (error) {
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

module.exports = app.listen(3000);
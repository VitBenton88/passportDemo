const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//authentication packages
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const bcrypt = require('bcrypt');

// Initialize Express
const app = express();

// Require all models
const db = require("./models");

// Configure body parser for AJAX requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//set up cookies for sessions
app.use(cookieParser());

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/passportTest";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, {
    useMongoClient: true
});

app.use(session({
    secret: 'skdjsfndij', //random key
    store: new MongoStore({ url: MONGODB_URI }),
    resave: false,
    saveUninitialized: false
    // cookie: { secure: true } <=for https only
}));

//Passport.js config
app.use(passport.initialize());
app.use(passport.session());


// Routes
// =============================================================
// require("./routes/api-routes.js")(app);
require("./routes/api-routes.js")(app);

passport.serializeUser( (user, done) => {
    done(null, user);
});

passport.deserializeUser( (user, done) => {
    db.User
        .findOne({ _id: user.userID })
            .then((user, error) => {

                if (error) {
                    done(error);
                };

                done(null, user);

            })
});

passport.use(new LocalStrategy({
        usernameField: 'email'//change default username to email
    },
    (email, password, done) => {

        console.log(email);
        console.log(password);
        // return done(null, "LOGIN SUCCESSFUL!");

        db.User
            .findOne({ email })
            .then((user, error) => {

                if (error) {
                    done(error);
                };

                const hashPass = user.password;

                console.log("Hash: " + hashPass);

                if (hashPass.length === 0) { //essentially, if no user info is returned
                    done(null, false);
                } else { //... else, run the bycrypt compare method to authenticate

                    //bcrypt de-hash
                    bcrypt.compare(password, hashPass, (err, response) => {

                        if (response === true) {
                            console.log("Successful login!");
                            return done(null, { userID: user._id });
                        } else {
                            console.log("Unsuccessful login!");
                            return done(null, false);
                        }

                    });

                }

            })


    }
));

//set port
const PORT = process.env.PORT || 3001;

// Start the server
app.listen(PORT, () => {
    console.log(`🌎  ==> API Server now listening on PORT ${PORT}!`);
});
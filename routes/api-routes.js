// Dependencies
// =============================================================
const passport = require('passport');
const db = require("../models");
const path = require("path");
const bcrypt = require('bcrypt');
const session = require('express-session');
const authenticationMiddleware = require('../utils/authenticationMiddleware');
const saltRounds = 10;

// Routes
// =============================================================
module.exports = (app) => {

    // send basic index.html file at root
    app.get("/", (req, res) => {

        //console log user info if any
        console.log(req.user);
        console.log(req.isAuthenticated());

        res.send("../public/index.html")

    });

    // register new user
    app.post("/register", (req, res) => {

        const email = req.body.email;
        const password = req.body.password;

        bcrypt.hash(password, saltRounds, (err, hash) => {

            const newUser = {
                email,
                password: hash
            };

            db.User
                .create(newUser)
                .then((user) => {

                    //console.log(user);
                    console.log("This is the userID for new user:");
                    console.log(user._id);

                    db.User
                        .findOne({ _id: user._id })
                        .then((signedInUser, error) => {

                            if (error) throw (error);

                            console.log("NEW USER CREATED: ");
                            console.log(signedInUser);
                            //deserialize config is expecting user.userID to be accessible
                            req.login({userID: signedInUser._id}, (err) => {

                                res.redirect("/");

                            })

                        })

                })
                .catch((err) => {
                    // If an error occurred, send it to the client
                    console.log(err);
                    res.redirect("/");
                });
        });

    });

    app.post("/login", passport.authenticate('local', {

        successRedirect: "/profile", //if login was successful, redirect to profile page
        failureRedirect: "/" //if login unseccussful, redirect to homepage

    }), );

    app.post("/logout", (req, res) => {

        console.log(`Logging out user:`);
        console.log(req.user);

        req.session.destroy( (err) => {
            req.logout();
            res.send(true);
        })

    });

    // profile page. Only renders if authentication is verified, if not, redirect to root 
    app.get("/profile", authenticationMiddleware(), (req, res) => {

        //console log user info if any
        console.log(req.user);
        console.log(req.isAuthenticated());

        res.redirect("/")

    });


};

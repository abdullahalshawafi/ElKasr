const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs");

//get user model
const User = require('../models/user');

/*
 * GET register
 */
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

/*
 * GET login
 */
router.get('/login', (req, res) => {
    if (res.locals.user)
        res.redirect('/');
    res.render('login', {
        title: 'Login'
    });
});

/*
 * GET logout
 */
router.get('/logout', (req, res) => {
    delete req.session.cart;
    req.logOut();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

/*
 * POST register
 */
router.post('/register', (req, res) => {
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;
    const address = req.body.address;
    const phone = req.body.phone;

    req.checkBody('firstname', 'You must enter your first name.').notEmpty();
    req.checkBody('lastname', 'You must enter your last name.').notEmpty();
    req.checkBody('email', 'You must enter a valid email.').isEmail();
    req.checkBody('username', 'You must enter a username.').notEmpty();
    req.checkBody('password', 'You must enter a password.').notEmpty();
    req.checkBody('password2', 'Passwords do not match.').equals(password);
    req.checkBody('address', 'You must enter an address').notEmpty();
    req.checkBody('phone', 'You must enter a phone number').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: 'Register'
        });
    } else {
        User.findOne({ username: username }, (err, user) => {
            if (err) return console.log(err);
            if (user) {
                req.flash('danger', 'Username is not available, please enter another one.');
                res.redirect('/usres/register');
            } else {
                const user = new User({
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    username: username,
                    password: password,
                    address: address,
                    phone: phone,
                    admin: 0
                });

                bcrypt.genSalt(10, (err, salt) => {
                    if (err) return console.log(err);
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) return console.log(err);
                        user.password = hash;

                        user.save(err => {
                            if (err) return console.log(err);
                            req.flash('success', 'You are now registered!');
                            res.redirect('/users/login');
                        });
                    });
                });
            }
        });
    }

});

/*
 * POST login
 */
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//exports
module.exports = router;
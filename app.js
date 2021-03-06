const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config/database");
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileUpload = require("express-fileupload");
const passport = require("passport");

//connecting to db
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB")
});

//init app
const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//public folder setup
app.use(express.static(path.join(__dirname, 'public')));

//global errors variable setup
app.locals.errors = null;

//get page model
const Page = require('./models/page');

//get all pages
Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
    if (err) return console.log(err);
    app.locals.pages = pages;
});

//get category model
const Category = require('./models/category');

//get all categories
Category.find({}, (err, categories) => {
    if (err) return console.log(err);
    app.locals.categories = categories;
});

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//express-fileupload middleware
app.use(fileUpload());

//express-session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    //cookie: { secure: true }
}));

//express-validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },

    customValidators: {
        isImage: (value, filename) => {
            const extension = (path.extname(filename)).toLowerCase();
            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.jpeg':
                    return '.jpeg';
                case '.png':
                    return '.png';
                case '':
                    return '.jpg';
                default:
                    return false;
            }
        }
    }
}));

//express-messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});

//passport config
require("./config/passport")(passport);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

//set routes
const pages = require("./routes/pages");
const products = require("./routes/products");
const cart = require("./routes/cart");
const users = require("./routes/users");
const adminPages = require("./routes/adminPages");
const adminCategories = require("./routes/adminCategories");
const adminProducts = require("./routes/adminProducts");

app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/users', users);
app.use('/products', products);
app.use('/cart', cart);
app.use('/', pages);

//starting the server
const port = 7000;
app.listen(port, err => {
    console.log(`Server started listening at ${port}`);
});
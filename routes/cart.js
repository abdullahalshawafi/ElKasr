const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const isUser = require('../config/auth').isUser;

//get product model
const Product = require('../models/product');

/*
 * GET add product to cart
 */
router.get('/add/:product', (req, res) => {
    const slug = req.params.product;
    Product.findOne({ slug: slug }, (err, product) => {
        if (err) return console.log(err);
        if (typeof req.session.cart === "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: product.title,
                qty: 1,
                price: parseFloat(product.price).toFixed(2),
                image: '/products images/' + product._id + '/' + product.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;
            for (let i = 0; i < cart.length; i++) {
                if ((cart[i].title.replace(/\s+/g, '-').toLowerCase()) === slug) {
                    cart[i].qty++;
                    newItem = false;
                    break;
                }
            }
            if (newItem) {
                cart.push({
                    title: product.title,
                    qty: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: '/products images/' + product._id + '/' + product.image
                });
            }
        }
        req.flash('success', 'Product added!');
        res.redirect('back');
    });
});

/*
 * GET remove product from cart
 */
router.get('/remove/:product', (req, res) => {
    const slug = req.params.product;
    var cart = req.session.cart;
    if (cart) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].title === slug) {
                if (cart[i].qty > 1) {
                    cart[i].qty--;
                }
                break;
            }
        }
    }
    req.flash('success', 'Product removed!');
    res.redirect('back');
});

/*
 * GET clear product from cart
 */
router.get('/clear/:product', (req, res) => {
    const slug = req.params.product;
    var cart = req.session.cart;
    if (cart) {
        for (let i = 0; i < cart.length; i++) {
            if (cart[i].title === slug) {
                cart.splice(i, 1);
                if (cart.length === 0)
                    delete req.session.cart;
                break;
            }
        }
    }
    req.flash('success', 'Product cleared!');
    res.redirect('back');
});

/*
 * GET cart checkout
 */
router.get('/checkout', isUser, (req, res) => {
    res.render('checkout', {
        title: 'Checkout',
        cart: req.session.cart
    });
});

/*
 * GET update product
 */
router.get('/update/:product', (req, res) => {
    const slug = req.params.product;
    var cart = req.session.cart;
    const action = req.query.action;

    for (let i = 0; i < cart.length; i++) {
        if (cart[i].title === slug) {
            switch (action) {
                case 'add':
                    cart[i].qty++;
                    break;

                case 'remove':
                    if (cart[i].qty > 1) {
                        cart[i].qty--;
                        break;
                    }

                case 'clear':
                    cart.splice(i, 1);
                    if (cart.length === 0)
                        delete req.session.cart;
                    break;

                default:
                    console.log('Update Problem.');
                    break;
            }
            break;
        }
    }
    req.flash('success', 'Cart updated!');
    res.redirect('/cart/checkout');
});

/*
 * GET clear cart
 */
router.get('/clear', (req, res) => {
    delete req.session.cart;
    req.flash('success', 'Cart cleared!');
    res.redirect('/cart/checkout');
});

// /*
//  * GET purchase
//  */
router.get('/purchase', (req, res) => {
    // const user = req.user;
    // const cart = req.session.cart;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        secure: false,
        port: 25,
        auth: {
            user: 'elkasrdental.co@gmail.com',
            pass: 'dentalelkasr522020'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const handlebarOptions = {
        viewEngine: {
            extName: '.hbs',
            partialsDir: './views/partials',
            layoutsDir: './views/layouts',
            defaultLayout: '',
        },
        viewPath: './views/partials',
        extName: '.hbs',
    };

    transporter.use('compile', hbs(handlebarOptions));

    const HelperOtions = {
        from: '"El Kasr"<elkasrdental.co@gmail.com>',
        to: 'elkasrdental.co@gmail.com',
        subject: 'New purchase from Dr. ' + req.user.firstname + ' ' + req.user.lastname,
        template: 'Purchase'
    }

    transporter.sendMail(HelperOtions, (err, info) => {
        if (err) return console.log(err);
        delete req.session.cart;
        req.flash('success', 'Purchase Done!');
        res.redirect('/cart/checkout');
    });
});

//exports
module.exports = router;
const express = require("express");
const router = express.Router();
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

//exports
module.exports = router;
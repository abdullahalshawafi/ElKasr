const express = require("express");
const router = express.Router();

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
router.get('/checkout', (req, res) => {
    res.render('checkout', {
        title: 'Checkout',
        cart: req.session.cart
    });
});

//exports
module.exports = router;
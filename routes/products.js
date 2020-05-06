const express = require("express");
const router = express.Router();
const fs = require("fs-extra");

//get product model
const Product = require('../models/product');

//get category model
const Category = require('../models/category');

/*
 * GET all products
 */
router.get('/', (req, res) => {
    const loggedIn = (req.isAuthenticated()) ? true : false;
    Product.find((err, products) => {
        if (err) return console.log(err);
        res.render('allProducts', {
            title: 'All products',
            products: products,
            loggedIn: loggedIn
        });
    });
});

/*
 * POST a product by search
 */
router.post('/search', (req, res) => {
    const loggedIn = (req.isAuthenticated()) ? true : false;
    const search = req.body.Search.replace(/\s+/g, '-').toLowerCase();
    if (search == "")
        res.redirect("back");

    Product.find((err, products) => {
        if (err) return console.log(err);
        res.render('ProductsBySearch', {
            title: 'products',
            user: req.user,
            products: products,
            search: search,
            loggedIn: loggedIn
        })
    });
});

/*
 * GET a product by category
 */
router.get('/:slug', (req, res) => {
    const slug = req.params.slug;
    const loggedIn = (req.isAuthenticated()) ? true : false;
    Category.findOne({ slug: slug }, (err, category) => {
        if (err) return console.log(err);
        if (category) {
            Product.find({ category: category.slug }, (err, products) => {
                if (err) return console.log(err);
                res.render('categoryProducts', {
                    title: category.title,
                    products: products,
                    loggedIn: loggedIn
                });
            });
        }
        else
            res.redirect('/products');
    });
});

/*
 * GET product details
 */
router.get('/:category/:product', (req, res) => {
    var galleryImages = null;
    const loggedIn = (req.isAuthenticated()) ? true : false;
    const productSlug = req.params.product;
    Product.findOne({ slug: productSlug }, (err, product) => {
        if (err) return console.log(err);
        const galleryDir = 'public/products images/' + product._id + '/gallery';
        fs.readdir(galleryDir, (err, files) => {
            if (err) return console.log(err);
            galleryImages = files;
            res.render('product', {
                title: product.title,
                product: product,
                galleryImages: galleryImages,
                loggedIn: loggedIn
            });
        });
    });
});

//exports
module.exports = router;
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
    Product.find((err, products) => {
        if (err) return console.log(err);
        res.render('allProducts', {
            title: 'All products',
            products: products
        });
    });
});

/*
 * GET a product by category
 */
router.get('/:slug', (req, res) => {
    const slug = req.params.slug;
    Category.findOne({ slug: slug }, (err, category) => {
        Product.find({ category: category.slug }, (err, products) => {
            if (err) return console.log(err);
            res.render('categoryProducts', {
                title: category.title,
                products: products
            });
        });
    });
});

/*
 * GET product details
 */
router.get('/:category/:product', (req, res) => {
    var galleryImages = null;
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
                galleryImages: galleryImages
            });
        });
    });
});

//exports
module.exports = router;
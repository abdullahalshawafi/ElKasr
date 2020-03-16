var express = require("express");
var router = express.Router();
var mkdirp = require("mkdirp");
var fs = require("fs-extra");
var resizeImg = require("resize-img");

//get product model
var Product = require('../models/product');
//get category model
var Category = require('../models/category');

/*
 * GET products index
 */
router.get('/', (req, res) => {
    var count;
    Product.countDocuments((err, c) => {
        count = c;
    });
    Product.find((err, products) => {
        res.render('admin/products', {
            products: products,
            count: count
        });
    });
});

/*
 * GET add product
 */
router.get('/add-product', (req, res) => {
    var title = "";
    var description = "";
    var price = "";

    Category.find((err, categories) => {
        res.render('admin/add_products', {
            title: title,
            description: description,
            categories: categories,
            price: price
        });
    });
});

/*
 * GET edit product
 */
router.get('/edit-product/:id', (req, res) => {
    var errors;
    if (req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    Category.find((err, categories) => {
        Product.findById(req.params.id, (err, product) => {
            if (err) return console.log(err);
            var galleryDir = 'public/products images/' + product._id + '/gallery';
            var galleryImages = null;
            fs.readdir(galleryDir, (err, files) => {
                if (err) return console.log(err);
                galleryImages = files;
                res.render('admin/edit_products', {
                    errors: errors,
                    title: product.title,
                    description: product.description,
                    categories: categories,
                    category: product.category.replace(/\s+/g, '-').toLowerCase(),
                    price: product.price,
                    image: product.image,
                    galleryImages: galleryImages,
                    id: product._id
                });
            });
        });
    });
});

/*
 * GET delete product
 */
router.get('/delete-product/:id', (req, res) => {
    const id = req.params.id;
    const path = 'public/products images/' + id;
    fs.remove(path, err => {
        if (err) return console.log(err);
        Product.findByIdAndRemove(req.params.id, (err) => {
            if (err) return console.log(err);
            req.flash('success', 'Product deleted!');
            res.redirect('/admin/products');
        });
    });
});

/*
 * GET delete image
 */
router.get('/delete-image/:image', (req, res) => {
    var originalImage = 'public/products images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbsImage = 'public/products images/' + req.query.id + '/gallery/thumbs/' + req.params.image;
    fs.remove(originalImage, err => {
        if (err) return console.log(err);
        fs.remove(thumbsImage, err => {
            if (err) return console.log(err);
            req.flash('success', 'Image deleted!');
            res.redirect('/admin/products/edit-product/' + req.query.id);
        });
    });
});

/*
 * Post product gallery
 */
router.post('/product-gallery/:id', (req, res) => {
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/products images/' + id + '/gallery/' + req.files.file.name;
    var thumbsPath = 'public/products images/' + id + '/gallery/thumbs/' + req.files.file.name;

    productImage.mv(path, (err) => {
        if (err) return console.log(err);
        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then((buf) => {
            fs.writeFileSync(thumbsPath, buf);
        });
    });

    res.sendStatus(200);

});

/*
 * POST add product
 */
router.post('/add-product', (req, res) => {
    var imageFile = (req.files !== null) ? req.files.image.name : "";
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('description', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image, please check that the file extension is an image extension.').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var description = req.body.description;
    var category = req.body.category;
    var price = req.body.price;

    var errors = req.validationErrors();
    if (errors) {
        Category.find((err, categories) => {
            res.render('admin/add_products', {
                errors: errors,
                title: title,
                description: description,
                categories: categories,
                price: price
            });
        });
    } else {
        Product.findOne({ slug: slug }, (err, product) => {
            if (product) {
                req.flash('danger', 'Product title already exists, choose another title.');
                Category.find((err, categories) => {
                    res.render('admin/add_products', {
                        title: title,
                        description: description,
                        categories: categories,
                        price: price
                    });
                });
            } else {
                price = parseFloat(price).toFixed(2);
                var product = new Product({
                    title: title,
                    slug: slug,
                    description: description,
                    category: category,
                    price: price,
                    image: imageFile
                });
                product.save(err => {
                    if (err) return console.log(err);
                    mkdirp('public/products images/' + product._id, (err) => {
                        if (err) return console.log(err);
                    });
                    mkdirp('public/products images/' + product._id + '/gallery', (err) => {
                        if (err) return console.log(err);
                    });
                    mkdirp('public/products images/' + product._id + '/gallery/thumbs', (err) => {
                        if (err) return console.log(err);
                    });
                    var productImage = req.files.image;
                    var path = 'public/products images/' + product._id + '/' + imageFile;
                    productImage.mv(path, function (err) {
                        if (err) return console.log(err);
                    });
                    req.flash('success', 'Product added!');
                    res.redirect('/admin/products');
                });
            }
        });
    }

});

/*
 * POST edit product
 */
router.post('/edit-product/:id', (req, res) => {
    var imageFile = (req.files !== null) ? req.files.image.name : req.body.imageFile;
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('description', 'Description must have a value.').notEmpty();
    req.checkBody('price', 'Price must have a value.').isDecimal();
    req.checkBody('image', 'You must upload an image, please check that the file extension is an image extension.').isImage(imageFile);

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var description = req.body.description;
    var category = req.body.category;
    var price = req.body.price;
    var prevImage = req.body.prevImage;
    var id = req.params.id;

    var errors = req.validationErrors();
    if (errors) {
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/' + id);
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, (err, product) => {
            if (err) return console.log(err);
            if (product) {
                req.flash('danger', 'Product title already exits, choose another title.');
                res.redirect('/admin/products/edit-product/' + id);
            } else {
                Product.findById(id, (err, product) => {
                    if (err) return console.log(err);
                    product.title = title;
                    product.slug = slug;
                    product.description = description;
                    product.price = parseFloat(price).toFixed(2);
                    product.category = category;
                    product.image = imageFile;
                    product.save(err => {
                        if (err) return console.log(err);
                        if (prevImage !== imageFile) {
                            fs.remove('public/products images/' + id + '/' + prevImage, err => {
                                if (err) return console.log(err);
                            });
                            var productImage = req.files.image;
                            var path = 'public/products images/' + id + '/' + imageFile;
                            productImage.mv(path, function (err) {
                                if (err) return console.log(err);
                            });
                        }


                        req.flash('success', 'Product edited!');
                        res.redirect('/admin/products/edit-product/' + id);
                    });
                });
            }
        });
    }
});

//exports
module.exports = router;
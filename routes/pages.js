const express = require("express");
const router = express.Router();

//get page model
const Page = require('../models/page');

/*
 * GET home
 */
router.get('/', (req, res) => {
    Page.findOne({ slug: 'home' }, (err, page) => {
        if (err) return console.log(err);
        res.render('index', {
            title: page.title,
            content: page.content
        });
    });
});

/*
 * GET a page
 */
router.get('/:slug', (req, res) => {
    const slug = req.params.slug;
    Page.findOne({ slug: slug }, (err, page) => {
        if (err) return console.log(err);
        if (!page)
            res.redirect('/');
        else {
            res.render('index', {
                title: page.title,
                content: page.content
            });
        }
    });
});

//exports
module.exports = router;
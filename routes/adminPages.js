const express = require("express");
const router = express.Router();

//get page model
const Page = require('../models/page');

/*
 * GET pages index
 */
router.get('/', (req, res) => {
    Page.find({}).sort({ sorting: 1 }).exec((err, pages) => {
        if (err) return console.log(err);
        res.render('admin/pages', {
            pages: pages
        });
    });
});

/*
 * GET add page
 */
router.get('/add-page', (req, res) => {
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_pages', {
        title: title,
        slug: slug,
        content: content
    });
});

/*
 * GET edit page
 */
router.get('/edit-page/:id', (req, res) => {
    Page.findById(req.params.id, (err, page) => {
        if (err) return console.log(err);
        res.render('admin/edit_pages', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

/*
 * GET delete pages
 */
router.get('/delete-page/:id', (req, res) => {
    Page.findByIdAndRemove(req.params.id, (err) => {
        if (err) return console.log(err);
        req.flash('success', 'Page deleted!');
        res.redirect('/admin/pages');
    });
});

/*
 * POST add page
 */
router.post('/add-page', (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug === "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    var errors = req.validationErrors();
    if (errors) {
        res.render('admin/add_pages', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({ slug: slug }, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug already exists, choose another slug.');
                res.render('admin/add_pages', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                const page = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });
                page.save(err => {
                    if (err) return console.log(err);
                    req.flash('success', 'Page added!');
                    res.redirect('/admin/pages');
                });
            }
        });
    }

});

/*
 * POST reorder pages
 */
router.post('/reorder-page', (req, res) => {
    const ids = req.body['id[]'];
    var count = 0;
    for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, (err, page) => {
                page.sorting = count;
                page.save(err => {
                    if (err) return console.log(err);
                });
            });
        })(count);
    }
});

/*
 * POST edit page
 */
router.post('/edit-page/:id', (req, res) => {
    req.checkBody('title', 'Title must have a value.').notEmpty();
    req.checkBody('content', 'Content must have a value.').notEmpty();

    const title = req.body.title;
    const slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    if (slug === "")
        slug = title.replace(/\s+/g, '-').toLowerCase();
    const content = req.body.content;
    const id = req.params.id;

    const errors = req.validationErrors();
    if (errors) {
        res.render('admin/edit_pages', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, (err, page) => {
            if (page) {
                req.flash('danger', 'Page slug already exists, choose another slug.');
                res.render('admin/edit_pages', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, (err, page) => {
                    if (err) return console.log(err);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(err => {
                        if (err) return console.log(err);
                        req.flash('success', 'Page edited!');
                        res.redirect('/admin/pages/edit-page/' + id);
                    });
                });
            }
        });
    }

});

//exports
module.exports = router;
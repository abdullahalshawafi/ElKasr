const express = require("express");
const router = express.Router();

/*
 * GET pages index
 */
router.get('/', (req, res) => {
    res.send('hello admin');
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
 * POST add page
 */
router.post('/add-page', (req, res) => {


    res.render('admin/add_pages', {
        title: title,
        slug: slug,
        content: content
    });
});

//exports
module.exports = router;
const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.send('hello admin');
});

//exports
module.exports = router;
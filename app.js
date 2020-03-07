const express = require("express");
const path = require("path");

//init app
const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//public folder setup
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send("Home Page");
});

//starting the server
const port = 7000;
app.listen(port, err => {
    console.log(`Server started listening at ${port}`);
});
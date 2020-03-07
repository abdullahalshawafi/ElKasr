const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config/database");

//connecting to db
mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB")
});

//init app
const app = express();

//view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//public folder setup
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index', {
        title: 'Home'
    });
});

//starting the server
const port = 7000;
app.listen(port, err => {
    console.log(`Server started listening at ${port}`);
});
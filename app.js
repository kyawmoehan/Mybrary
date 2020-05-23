if(process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const express = require('express');
const mongoose = require('mongoose');
const expressLayouts = require('express-ejs-layouts');

const indexRouter = require('./routes/index');

const app = new express();
const PORT = process.env.PORT || 3000;

// connect to mongodb
mongoose.connect(process.env.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
});
const db = mongoose.connection;
db.on('error', error => { console.error(error); });
db.once('open', () => { console.log('Connected to MognoDB'); });

// set view engine
app.set('view engine', 'ejs');
app.set('layout', 'layout');
app.use(expressLayouts);

// static file
app.use(express.static('public'));

// index routes
app.use('/', indexRouter);

// server on port
app.listen(PORT, (err) => {
    if(err) throw err;
    console.log(`Server running on port ${PORT}`);
});
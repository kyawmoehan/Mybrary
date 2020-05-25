const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

// upload image
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/bookCovers');
    },
        filename: function(req, file, cb) {
            cb(null, new Date().toISOString() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});


// All books route
router.get('/', async (req, res) => {
    let query = Book.find();
    if(req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'));
    }   
    if(req.query.publishBefore != null && req.query.publishBefore != '') {
        query = query.lte('publishDate', req.query.publishBefore);
    }   
    if(req.query.publishAfter != null && req.query.publishAfter != '') {
        query = query.gte('publishDate', req.query.publishAfter);
    }   
    try {
        const books = await query.exec();
        res.render('books/index', {books: books, searchOptions: req.query});
    } catch (error) {
        res.redirect('/');
    }
});

//  New book form
router.get('/new', async (req, res) => {
    renderNewPage(res, new Book());
});

// Create new book
router.post('/', upload.single('cover') ,async (req, res) => {
    console.log(req.file);
    // const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImage: req.file.path,
        description: req.body.description
    });
    try {
        const newBook = await book.save();
        res.redirect('/books');
    } catch (error) {
        if(book.coverImage != null) {
            removeBookCover(book.coverImage);
        }
        renderNewPage(res, book, true);
    }
});


async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({});
        const params = {
            book: book, 
            authors: authors
        }
        if(hasError) {
            params.errorMessage = "Error Creating Book"
        }
        res.render('books/new', params);
    } catch (error) {
        res.redirect('/books');
    }
}

function removeBookCover(filename) {
    fs.unlink(filename, err => {
        if(err) console.log(err);
    });
};

module.exports = router;
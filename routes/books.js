const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

// upload image
const imageMimeTypes = ['image/jpeg', 'image/png']; 

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
router.post('/' ,async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,  
        description: req.body.description
    });
    saveCover(book, req.body.cover);
    try {
        const newBook = await book.save();
        res.redirect(`/books/${newBook.id}`);
    } catch (error) {
        renderNewPage(res, book, true);
    }
});


//  edit book form
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);   
    } catch (error) {
        res.redirect('/books');
    }
});

// Edit book
router.put('/:id' ,async (req, res) => {
    const updateBook = {
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,  
        description: req.body.description
    };
    if(req.body.cover !== null && req.body.cover !== '') {
        saveCover(updateBook, req.body.cover);
    }
    let book;
    try {
        book = await Book.findByIdAndUpdate(req.params.id, {$set: updateBook});
        res.redirect(`/books/${book.id}`);
    } catch (error) {
        if(book != null) {
            renderEditPage(rew, book, true);
        } else {
            res.redirect('/books');
        }
    }
});

// get one books 
router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render('books/show', {book});
    } catch (error) {
        res.redirect('/books');
    }
});

// delete book
router.delete('/:id', async (req, res) => {
    let book;
    try {
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect('/books');
    } catch (error) {
        if(book != null) {
            res.render('books/show', {book, errorMessage: 'Colud not delete the book'});
        } else {
            res.redirect('/books');
        }
    }
});

async function renderNewPage(res, book, hasError = false) {
    renderFormPage(res, book, 'new', hasError);
}

function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError);
}

async function renderFormPage(res, book, form, hasError = false){
    try {
        const authors = await Author.find({});
        const params = {
            book: book, 
            authors: authors
        }
        if(hasError) {
            if(form === 'new') {
                params.errorMessage = "Error Creating Book";
            } else if(form === 'edit') {
                params.errorMessage = "Error Updating Book"
            }
        }
        res.render(`books/${form}`, params);
    } catch (error) {
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeTypes.includes(cover.type)) {
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;
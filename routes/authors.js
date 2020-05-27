const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

// All authors
router.get('/', async (req, res) => {
    let searchOptions = {};
    if(req.query.name !=  null && req.query.name != '') {
        searchOptions.name = new RegExp(req.query.name, 'i');
    } 
    try {
        const authors = await Author.find(searchOptions);
        res.render('authors/index', { authors: authors, searchOptions: req.query });
    } catch (error) {
        res.redirect('/');
    }
});

//  New author form
router.get('/new', async (req, res) => {
    res.render('authors/new', { author: new Author()});
});

// Create new author
router.post('/', async (req, res) => {
    const author = new Author({
        name: req.body.name 
    });
    try {
        const newAuthor = await author.save();
        res.redirect(`/authors/${newAuthor.id}`);
    } catch (error) {
        res.render('authors/new', { author: author, errorMessage: error});
    }
});

// Get the author
router.get('/:id', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        const books = await Book.find({ author: author.id }).limit(6).exec()
        console.log(author.id);
        res.render('authors/show', {author, booksByAuthor: books});
    } catch (error) {
        res.redirect('/');
    }
});

// Edit and update Author
router.get('/:id/edit', async (req, res) => {
    try {
        const author = await Author.findById(req.params.id);
        res.render('authors/edit', { author: author });
    } catch (error) {
        res.redirect('/authors');
    }
});

router.put('/:id', async (req, res) => {
    const updateAuthor = {
        name: req.body.name
    }
    let authors;
    try {
        author = await Author.findByIdAndUpdate(req.params.id, {$set: updateAuthor} );
        res.redirect(`/authors/${author.id}`);
    } catch (error) {
        if(author == null) {
            res.redirect('/');
        } else {
            res.render('authors/edit', { author: author, errorMessage: error});
        }
    }
});

// Delete Author
router.delete('/:id', async (req, res) => {
    let authors;
    try {
        author = await Author.findById(req.params.id);
        await author.remove();
        res.redirect('/authors');
    } catch (error) {
        if(author == null) {
            res.redirect('/');
        } else {
            res.redirect(`/authors/${author.id}`)
        }
    }
    res.send('Delete author'+ req.params.id);
});

module.exports = router;
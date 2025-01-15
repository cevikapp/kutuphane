const express = require('express');
const router = express.Router();
const { Book, AuditLog } = require('../db');
const Response = require('../lib/Response');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config');
const authenticateToken = require('../middlewares/authMiddleware');
const bcrypt = require('bcrypt');
const checkPermission = require('../lib/checkPermissions');

router.get('/', async (req, res, next) => {
    try {
        const books = await Book.findAll();
        res.json(Response.successResponse(books));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.get('/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        res.json(Response.successResponse(book));
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.post('/add', authenticateToken, async (req, res) => {
    try {
        const newBook = await Book.create(req.body);
        const { book_name, author, category_id, isbn } = req.body;
        const logDetails = {
            action: 'Add Book',
            details: JSON.stringify({ book_name, author, category_id, isbn }),
            performed_by: req.user.id, 
            timestamp: new Date(),
        };
        await AuditLog.create(logDetails);

        res.json(Response.successResponse(newBook));
    } catch (error) {
        console.log('Book add error:', error);
        
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.patch('/update/:id', authenticateToken, async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (book) {
            await book.update(req.body);
            res.json(Response.successResponse(book));
        } else {
            throw new Error('Book not found');
        }
        const { book_name, author, category_id, isbn } = req.body;
        const logDetails = {
            action: 'Update Book',
            details: JSON.stringify({ book_name, author, category_id, isbn }),
            performed_by: req.user.id, 
            timestamp: new Date(),
        };
        await AuditLog.create(logDetails);

    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

router.delete('/delete/:id', authenticateToken, checkPermission("delete_book"), async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (book) {
            await book.destroy();
            const logDetails = {
                action: 'Delete Book',
                details: JSON.stringify({
                    book_name: book.book_name,
                    author: book.author,
                    category_id: book.category_id,
                    isbn: book.isbn,
                }),
                performed_by: req.user.id, 
                timestamp: new Date(),
            };
            await AuditLog.create(logDetails);

            res.json(Response.successResponse(book));
        } else {
            throw new Error('Book not found');
        }
        
    } catch (error) {
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

module.exports = router;

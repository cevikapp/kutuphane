const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const { User, Book, Category } = require('../db'); 
const Response = require('../lib/Response');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config');
const bcrypt = require('bcrypt');
const checkPermission = require('../lib/checkPermissions');
const { Op } = require('sequelize');


router.get('/users', async (req, res) => {
  try {
    const { keyword } = req.query;
    const users = await User.findAll({
      where: {
        first_name: {
          [Op.iLike]: `%${keyword}%`
        }
      }
    });
    res.json(Response.successResponse(users));
  } catch (error) {
    
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get('/books', async (req, res) => {
  try {
    const { keyword } = req.query;
    const books = await Book.findAll({
      where: {
        book_name: {
          [Op.iLike]: `%${keyword}%`
        }
      }
    });
    res.json(Response.successResponse(books));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get('/categories', async (req, res) => {
  try {
    const { keyword } = req.query;
    const categories = await Category.findAll({
      where: {
        name: {
          [Op.iLike]: `%${keyword}%`
        }
      }
    });
    res.json(Response.successResponse(categories));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;

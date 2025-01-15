var express = require('express');
var router = express.Router();
const { Categories } = require('../db/models/Categories');
const Response = require("../lib/Response");
const CustomError = require("../lib/Error");
const Enum = require("../config/Enum");
const { Category, AuditLog } = require('../db');
const authenticateToken = require('../middlewares/authMiddleware');


router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.findAll();
    res.json(Response.successResponse(categories));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
  
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      res.json(Response.successResponse(category));
    } else {
      throw new CustomError(Enum.ERRORS.CATEGORY_NOT_FOUND);
    }
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.post('/add', authenticateToken, async (req, res) => {
  try {
    const newCategory = await Category.create(req.body); 
   

    const {name, created_by } = req.body;
    const logDetails = {
      action: 'Add Category',
      details: JSON.stringify({ name, created_by }),
      performed_by: req.user.id, 
      timestamp: new Date(),
    };
    await AuditLog.create(logDetails);

    res.json(Response.successResponse(newCategory));

  } catch (error) {
    console.log("buraaaaaaa:", error);
    
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.patch('/update/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      await category.update(req.body);
      res.json(Response.successResponse(category));
    } else {
      throw new CustomError(Enum.ERRORS.CATEGORY_NOT_FOUND);
    }
    const { name, is_active, created_by } = req.body;
    const logDetails = {
        action: 'Update Category',
        details: JSON.stringify({ name, is_active, created_by }),
        performed_by: req.user.id, 
        timestamp: new Date(),
    };
    await AuditLog.create(logDetails);

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.delete('/delete/:id', authenticateToken, async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (category) {
      await category.destroy();
      
      const {name, is_active, created_by} = category;
      const logDetails = {
        action: "Delete Category",
        details: JSON.stringify({name, is_active, created_by}),
        performed_by: req.user.id,
        timestamp: new Date()
      }

      await AuditLog.create(logDetails);

      res.json(Response.successResponse(category));
    } else {
      throw new CustomError(Enum.ERRORS.CATEGORY_NOT_FOUND);
    }
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

module.exports = router;

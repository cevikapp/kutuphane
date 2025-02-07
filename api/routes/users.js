const express = require('express');
const bcrypt = require('bcrypt'); 
const router = express.Router();
const { User, AuditLog } = require('../db');
const Response = require('../lib/Response');
const jwt = require('jsonwebtoken');
const {JWT_SECRET, JWT_EXPIRES_IN} = require('../config');
const authenticateToken = require('../middlewares/authMiddleware')

router.post('/register', async (req, res) => {
  try {
    const { email, password, ...rest } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json(
        Response.errorResponse({
          message: 'Email already in use',
          description: 'The email address is already associated with another account.',
        })
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      ...rest,
    });

    const systemUserEmail = 'system@example.com';
    let systemUser = await User.findOne({ where: { email: systemUserEmail } });
    const SYSTEM_USER_ID = systemUser.id;
    const logDetails = {
      action: 'Register User',
      details: JSON.stringify({
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        created_at: newUser.createdAt
      }),
      performed_by: SYSTEM_USER_ID,
      timestamp: new Date(),
    };
    await AuditLog.create(logDetails);

    res.status(201).json(Response.successResponse(newUser));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Received email:", email, "password:", password); 

    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
      
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {

      return res.status(401).json({ error: 'Geçersiz e-posta veya şifre.' });
    }

    const token = jwt.sign({ id: user.id, role_id: user.role_id}, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.status(200).json({ message: 'Giriş başarılı.', token, role_id: user.role_id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş işlemi sırasında bir hata oluştu.' });
  }
});


router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    res.json(Response.successResponse(user)); 
  } catch (err) {
    res.status(500).json({ error: 'Bir hata oluştu' });
  }
});


router.post('/add', authenticateToken, async (req, res) => {
  try {

    const { email, password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      email,
      password: hashedPassword,
      ...rest,
    }); 

    const logDetails = {
      action: 'Add User',
      details: JSON.stringify({
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        created_at: newUser.createdAt
      }),
      performed_by: req.user.id, 
      timestamp: new Date(),
    };

    await AuditLog.create(logDetails);

    res.json(Response.successResponse(newUser));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(Response.successResponse(users));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    res.json(Response.successResponse(user));
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.patch('/update/:id', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.update(req.body);
      res.json(Response.successResponse(user));
    } else {
      throw new Error('User not found');
    }
    const { email, password, first_name, last_name, phone_number, role_id } = req.body;
   
    const logDetails = {
        action: 'Update User',
        details: JSON.stringify({ email, password, first_name, last_name, phone_number, role_id }),
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
    const user = await User.findByPk(req.params.id);
    if (user) {
      await user.destroy();
      res.json(Response.successResponse(user));
    } else {
      throw new Error('User not found');
    }

    const {email, password, first_name, last_name, phone_number, role_id} = user;
    const logDetails = {
        action: 'Delete User',
        details: JSON.stringify({
          email, password, first_name, last_name, phone_number, role_id
        }),
        performed_by: req.user.id, 
        timestamp: new Date(),
    };
      await AuditLog.create(logDetails);

  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});


router.post('/logout', authenticateToken, (req, res) => {
  try {
    res.json({
      message: 'Çıkış işlemi başarılı.',
    });
  } catch (error) {
    let errorResponse = Response.errorResponse(error);
    res.status(errorResponse.code).json(errorResponse);
  }
});


module.exports = router;

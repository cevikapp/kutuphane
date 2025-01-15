const express = require('express');
const { AuditLog, User } = require('../db'); 
const checkPermission = require('../lib/checkPermissions'); 
const router = express.Router();

router.get('/', async (req, res) => {
  try {

    const logs = await AuditLog.findAll({
      include: {
        model: User,
        as: 'user', 
        attributes: ['id', 'email', 'first_name', 'last_name'],
      },
    });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      error: 'Logları çekerken bir hata oluştu.',
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const log = await AuditLog.findByPk(id, {
      include: {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'first_name', 'last_name'],
      },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: 'Log kaydı bulunamadı.',
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Log kaydını çekerken bir hata oluştu.',
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { action, details, performed_by } = req.body;
    const newLog = await AuditLog.create({
      action,
      details,
      performed_by
    });

    res.status(201).json({
      success: true,
      data: newLog,
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({
      success: false,
      error: 'Log kaydı oluşturulurken bir hata oluştu.',
    });
  }
});

module.exports = router;

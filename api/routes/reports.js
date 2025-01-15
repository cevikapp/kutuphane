const express = require('express');
const router = express.Router();
const { Report, User } = require('../db')
const Response = require('../lib/Response')
const { Op } = require('sequelize')

router.get('/monthly', async (req, res) => {
  let { month, year } = req.query;

  const now = new Date();
  month = parseInt(month) || now.getMonth() + 1;
  year = parseInt(year) || now.getFullYear();

  if (month < 1 || month > 12 || year < 1900 || isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: 'Geçersiz ay veya yıl değerleri' });
  }

  try {
      const startDate = new Date(Date.UTC(2025, 0, 1)).toISOString();
      const endDate = new Date(Date.UTC(2025, 11, 30, 23, 59, 59)).toISOString();

      const reports = await Report.findAll({
          where: {
              type: 'yearly',
              created_at: {
                  [Op.between]: [startDate, endDate],
              },
          },
      });
      console.log('Reports Found:', reports);

      return res.json(reports);
  } catch (error) {
      return res.status(500).json({ error: error.message });
  }
});


// Yeni bir rapor oluştur
router.post('/add', async (req, res) => {
    const { type, data, description } = req.body;
    try {
        
        const report = await Report.create({
            type,
            data,
            description
        });
        return res.status(201).json(report);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Belirli bir raporun detaylarını getir
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const report = await Report.findByPk(id);
        if (!report) return res.status(404).json({ message: 'Rapor bulunamadı.' });
        return res.json(report);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

module.exports = router;

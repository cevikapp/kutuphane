const express = require('express');
const router = express.Router();
const { Loan, Book, User, AuditLog } = require('../db'); // Loan, Book ve User modellerini içeri aktar
const Response = require('../lib/Response');
const { Sequelize, ENUM } = require('sequelize');
const checkPermission = require('../lib/checkPermissions');
const authenticateToken = require('../middlewares/authMiddleware');
const Enum = require('../config/Enum');
const CustomError = require("../lib/Error");

// Kitap ödünç verme işlemi
router.post('/lend', authenticateToken, checkPermission('add_loan'), async (req, res) => {
  try {
      const { book_id, loaner, lender, return_date } = req.body;
      const loanDate = new Date();
      const calculatedReturnDate = return_date || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // 15 gün sonrası varsayılan dönüş

      if (new Date(calculatedReturnDate) <= loanDate) {
        return res.status(400).json({
            error: 'Geçerli bir dönüş tarihi giriniz. Dönüş tarihi ödünç alma tarihinden sonra olmalıdır.',
        });
    }
    
      // Kitabın başka bir aktif ödünç kaydında olup olmadığını kontrol et
      const activeLoan = await Loan.findOne({
          where: {
              book_id,
              status: 'active', // Yalnızca aktif ödünçleri kontrol et
          }
      });

      if (activeLoan) {
          return res.status(400).json({
              error: 'Bu kitap şu anda ödünçte, geri dönene kadar ödünç verilemez.',
          });
      }

      // Yeni ödünç verme kaydı oluştur
      const newLoan = await Loan.create({
          book_id,
          loaner,
          lender,
          loan_date: loanDate,
          return_date: calculatedReturnDate,
      });

      const logDetails = {
        action: "Add Loan",
        details: JSON.stringify({book_id, loaner, lender, return_date }),
        performed_by: req.user.id,
        timestamp: new Date(),
      }

      await AuditLog.create(logDetails);

      res.status(201).json(Response.successResponse(newLoan));
  } catch (error) {
      console.log('Loan creation error:', error);
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
  }
});

// Ödünç verilen tüm kitapları listele
router.get('/', async (req, res) => {
    try {
        const loans = await Loan.findAll({
            include: [
                {
                    model: Book,
                    attributes: ['id'],
                },
                {
                    model: User,
                    attributes: ['id'],
                },
                {
                    model: User,
                    attributes: ['id'],
                },
            ],
        });

        res.status(200).json(Response.successResponse(loans));
    } catch (error) {
        console.log('Loan list error:', error);
        const errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
    }
});

// Belirli bir ödünç kaydını getirme
router.get('/:id', async (req, res) => {
  try {
      const loan = await Loan.findOne({
          where: {
              id: req.params.id
          },
          include: [
              {
                  model: Book,
                  attributes: ['id'],
              },
              {
                  model: User,
                  attributes: ['id'],
              },
              {
                  model: User,
                  attributes: ['id'],
              },
          ],
      });

      if (!loan) {
          return res.status(404).json({
              error: 'Loan record not found.',
          });
      }

      res.status(200).json(Response.successResponse(loan));
  } catch (error) {
      console.log('Loan list error:', error);
      const errorResponse = Response.errorResponse(error);
      res.status(errorResponse.code).json(errorResponse);
  }
});

// Belirli bir ödünç kaydını silme
router.delete('/:loanId', authenticateToken, checkPermission('delete_loan'), async (req, res) => {
    try {
        const { loanId } = req.params;
        
        // Loan kaydını bul
        const loan = await Loan.findByPk(loanId);

        if (!loan) {
            return res.status(404).json(Response.errorResponse({ 
                message: 'Loan record not found.' 
            }));
        }

        // Loan kaydını sil
        await loan.destroy();
        res.status(200).json(Response.successResponse({ 
            message: 'Loan record deleted successfully.' 
        }));

        // Log detaylarını hazırla
        const { book_id, loaner, lender, return_date } = loan;
        const logDetails = {
            action: "Delete Loan",
            details: JSON.stringify({ book_id, loaner, lender, return_date }),
            performed_by: req.user.id,
            timestamp: new Date()
        };

        // Log kaydet
        await AuditLog.create(logDetails);
    } catch (error) {
        console.error('Loan delete error:', error);

        if (!res.headersSent) {
            const errorResponse = Response.errorResponse(error);
            res.status(errorResponse.code).json(errorResponse);
        }
    }
});


// Ödünç kaydını güncelleme 
router.patch('/:loanId', authenticateToken, async (req, res) => {
    try {
        const loan = await Loan.findByPk(req.params.loanId);
        if (loan) {
          await loan.update(req.body);
          res.json(Response.successResponse(loan));
        } else {
          throw new Error('Loan not found');
        }
        const { book_id, loaner, lender, return_date } = loan;
        const logDetails = {
            action: 'Update Loan',
            details: JSON.stringify({ book_id, loaner, lender, return_date }),
            performed_by: req.user.id, 
            timestamp: new Date(),
        };
        await AuditLog.create(logDetails);
    
      } catch (error) {
        console.log("NEDİR??????", error);
        
        let errorResponse = Response.errorResponse(error);
        res.status(errorResponse.code).json(errorResponse);
      }
});

// Gecikmiş kitapları listeleme
router.get('/loans/overdue', async (req, res) => {
  try {
    const overdueLoans = await Loan.findAll({
      where: {
        return_date: {
          [Sequelize.Op.lt]: new Date(), // return_date bugünün tarihinden küçükse
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Gecikmiş kitaplar listelendi.',
      data: overdueLoans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gecikmiş kitaplar listelenirken bir hata oluştu.',
      error: error.message,
    });
  }
});

module.exports = router;

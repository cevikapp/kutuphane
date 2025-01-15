const cron = require('node-cron');
const { Loan } = require('../db');

// Her gün gece yarısı gecikmiş kitapları kontrol et
cron.schedule('0 0 * * *', async () => {
  const overdueLoans = await Loan.findAll({
    where: {
      return_date: {
        [Sequelize.Op.lt]: new Date(),
      },
    },
  });

  console.log('Gecikmiş kitaplar:', overdueLoans);
  // Burada e-posta veya başka bir bildirim işlemi yapabilirsiniz.
});

console.log('Overdue loans cron job başlatıldı.');

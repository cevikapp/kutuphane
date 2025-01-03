const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kutuphane', 'postgres', '38', {
  host: 'localhost',
  dialect: 'postgres',
  port: 5432,
  logging: false, // Konsol loglarını devre dışı bırakmak için
  dialectOptions: {
    ssl: false
  },
});

let instance = null;

class Database {
  constructor() {
    if (!instance) {
      this.connection = sequelize;
      instance = this;
    }

    return instance;
  }

  async connect() {
    try {
      await this.connection.authenticate(); // Bağlantıyı doğrula
      console.log('Veritabanına başarılı bir şekilde bağlanıldı.');
    } catch (error) {
      console.error('Veritabanına bağlanırken bir hata oluştu:', error);
      throw error; // Hatanın dışa aktarımı
    }
  }

  async disconnect() {
    try {
      await this.connection.close(); // Bağlantıyı kapat
      console.log('Veritabanı bağlantısı kapatıldı.');
    } catch (error) {
      console.error('Bağlantıyı kapatırken bir hata oluştu:', error);
    }
  }

  async query(sql, options) {
    try {
      return await this.connection.query(sql, options); // Sorgu çalıştır
    } catch (error) {
      console.error('Sorgu çalıştırılırken bir hata oluştu:', error);
      throw error;
    }
  }
}

module.exports = new Database();

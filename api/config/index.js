module.exports = {
    "LOG_LEVEL": process.env.LOG_LEVEL || 'debug',
    "CONNECTION_STRING": process.env.CONNECTION_STRING || 'mongodb://localhost:5432/kutuphane',
    
    JWT_SECRET: '123456', // Güvenli bir şekilde saklayın (örn: .env dosyasında)
    JWT_EXPIRES_IN: '24h', // Token geçerlilik süresi
}
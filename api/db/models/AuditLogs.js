const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      // Örneğin: 'create', 'update', 'delete', 'login', vb.
    },
    details: {
      type: DataTypes.JSONB, // Log ile ilgili detaylar
      allowNull: true, // Bu alan opsiyonel olabilir
    },
    performed_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users', // Kullanıcı modeline referans
        key: 'id',
      },
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'auditlogs'
  }
);

  // 'AuditLogs' tablosunun 'performed_by' kolonuyla 'Users' tablosuna ilişki kuruyoruz
  AuditLog.associate = (models) => {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'performed_by',
      as: 'user', // İlişkiyi isimlendirebiliriz
    });
  };

  return AuditLog;
};

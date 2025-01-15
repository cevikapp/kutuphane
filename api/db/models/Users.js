const {DataTypes} = require('sequelize');
const {Sequelize} = require('@sequelize/core');


module.exports = (sequelize) => {  

  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'roles', // Role tablosunun adı (veritabanındaki tablo adı)
        key: 'id',      // Role tablosundaki primary key
      },
      onUpdate: 'CASCADE', // Role tablosundaki bir id güncellenirse, bu tablo da güncellensin
      onDelete: 'SET NULL' // Role silinirse, bu sütun null olsun
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    first_name: {
      type: DataTypes.STRING
    },
    last_name: {
      type: DataTypes.STRING
    },
    phone_number: {
      type: DataTypes.STRING
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }

  }, {
    tableName: 'users',
    timestamps: true, 
  });

  return User;
};

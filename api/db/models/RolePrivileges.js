const { Sequelize } = require('@sequelize/core');
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RolePrivilege = sequelize.define('RolePrivilege', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
      unique: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    permission: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'role_privileges',
    timestamps: true,
  });

  return RolePrivilege;
};

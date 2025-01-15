const { DataTypes } = require('sequelize');
const {Sequelize} = require('@sequelize/core');

module.exports = (sequelize) => {
    const Report = sequelize.define('Report', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
            allowNull: false,
        },
        type: {
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
        data: {
            type: DataTypes.JSON, // Rapor içeriğini JSON olarak saklayabiliriz
            allowNull: true,
        },
        description: {
            type: DataTypes.STRING, // Rapor hakkında açıklama
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'pending', // Varsayılan olarak 'pending' olsun
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
        tableName: 'reports',
        timestamps: true,
    });

    return Report;
};

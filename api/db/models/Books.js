const {DataTypes} = require('sequelize');
const {Sequelize} = require('@sequelize/core');
const sequelize = require('sequelize');

module.exports = (sequelize) => {
    const Book = sequelize.define('Book', {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        book_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isbn: {
            type: DataTypes.STRING,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            reference: {
                model: 'categories',
                key: 'id',
            },
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            reference: {
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
        }
    }, {
        tableName: 'books',
        timestamps: true,

    });
}
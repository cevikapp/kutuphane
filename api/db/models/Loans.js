const {DataTypes} = require('sequelize');
const {Sequelize} = require('@sequelize/core');

module.exports = (sequelize) => {
    const Loan = sequelize.define('Loan', {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        book_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'books',
                key: 'id',
            },
        },
        loaner: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        lender: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        loan_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        return_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('active', 'returned'),
            defaultValue: 'active', // Default olarak aktif ödünç
        },
    }, {
        tableName: 'loans',
        timestamps: true,
    });
    
    return Loan;
    }
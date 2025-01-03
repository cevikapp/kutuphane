const {DataTypes} = require('sequelize');
const {Sequelize} = require('@sequelize/core');

module.exports = (sequelize) => {
    const UserRole = sequelize.define('UserRole', {
        id: {
            type: DataTypes.INTEGER,
            defaultValue: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
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
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'user_roles',
        timestamps: true,
    });
    
    return UserRole;
    }
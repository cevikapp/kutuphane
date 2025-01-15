const {DataTypes} = require('sequelize');
const {Sequelize} = require('@sequelize/core');

module.exports = (sequelize) => {
    const Book = sequelize.define('Book',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
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
                allowNull: true,
            },
            category: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    async isValidCategory(value) {
                        const categoryExists = await sequelize.models.Category.findOne({
                            where: {
                                name: value,
                            },
                        });
                        if(!categoryExists) {
                            throw new Error('Category does not exist');
                        }
                    }
                },
            },
            created_by: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
        },
        {
            tableName: 'books',
            timestamps: true,
        }
    );

    return Book;
};

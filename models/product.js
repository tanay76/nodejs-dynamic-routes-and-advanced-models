const Sequelize = require('Sequelize');
const sequelize = require('../util/database');

const Product = sequelize.define('product', {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: Sequelize.STRING,
    allowNull: true,
  },
  imageUrl: {
    type: Sequelize.STRING,
    allowNull: true
  },
  price: {
    type: Sequelize.DOUBLE,
    allowNull: true,
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
});

module.exports = Product;
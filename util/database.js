const Sequelize = require('Sequelize');

const sequelize = new Sequelize('node-complete', 'root', 'jainitai@root', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
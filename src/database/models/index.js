'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  // Verificar que la variable de entorno DATABASE_URL exista
  const dbUrl = process.env[config.use_env_variable];
  if (!dbUrl) {
    throw new Error(
      `❌ ERROR: La variable de entorno '${config.use_env_variable}' no está configurada.\n` +
      `En Render, debes:\n` +
      `1. Ir a tu Web Service → Environment\n` +
      `2. Agregar la variable 'DATABASE_URL' con la Internal Database URL de tu PostgreSQL\n` +
      `3. O conectar tu PostgreSQL database automáticamente desde el Dashboard`
    );
  }
  sequelize = new Sequelize(dbUrl, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

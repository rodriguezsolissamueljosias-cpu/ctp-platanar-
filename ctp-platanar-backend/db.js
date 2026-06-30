// db.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;
const dbDialect = process.env.DB_DIALECT;
const isProduction = process.env.NODE_ENV === 'production';
const hasSqlConfig = process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME;

const sequelizeOptions = { logging: false };
if (process.env.DB_SSL === 'true') {
  sequelizeOptions.dialectOptions = {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  };
}

let sequelize;
if (databaseUrl) {
  console.log('📌 Usando DATABASE_URL para la conexión a la base de datos');
  sequelize = new Sequelize(databaseUrl, sequelizeOptions);
} else {
  const dialect = dbDialect || (hasSqlConfig ? 'mysql' : 'sqlite');
  console.log(`📌 Configurando base de datos local con dialecto: ${dialect}`);

  if (isProduction && !databaseUrl && !hasSqlConfig && dialect === 'sqlite') {
    throw new Error(
      'No hay configuración de base de datos para producción. Define DATABASE_URL o DB_HOST/DB_USER/DB_NAME con DB_DIALECT=mysql.'
    );
  }

  if (dialect === 'sqlite') {
    const dataDir = isProduction
      ? path.join('/tmp', 'ctp-platanar-backend', 'data')
      : path.join(__dirname, 'data');

    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    const storage = path.join(dataDir, 'database.sqlite');
    sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect,
        ...sequelizeOptions
      }
    );
  }
}

module.exports = sequelize;

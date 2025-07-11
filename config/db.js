import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
dotenv.config({path: '.env'})

console.log('HOST:', process.env.BD_HOST);
console.log('PUERTO:', process.env.BD_PORT);
console.log('USUARIO:', process.env.BD_USUARIO);
console.log('BASE DE DATOS:', process.env.BD_NOMBRE);

const db = new Sequelize(
  process.env.BD_NOMBRE,
  process.env.BD_USUARIO,
  process.env.BD_PASS,
  {
    host: process.env.BD_HOST,
    port: process.env.BD_PORT,
    dialect: 'mysql',
    define: {
      timestamps: true,
    },
    pool: {
      max: 2,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    dialectOptions: {
      connectTimeout: 10000, // útil para producción
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  }
);

export default db;

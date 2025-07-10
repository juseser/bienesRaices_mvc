import { Sequelize } from "sequelize";
if (process.env.NODE_ENV !== 'production') {
  import('dotenv').then(dotenv => dotenv.config());
}

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
    port: process.env.BD_PORT ? Number(process.env.BD_PORT) : 3306, // fallback por si falta
    dialect: 'mysql',
    define: {
      timestamps: true,
    },
    pool: {
      max: 5,
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

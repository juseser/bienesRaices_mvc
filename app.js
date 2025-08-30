import express from 'express';// Importa el framework Express, que se usa para crear el servidor web y manejar rutas, peticiones, etc.
import csrf from 'csurf';// Importa el middleware 'csurf', que protege contra ataques CSRF (Cross-Site Request Forgery) usando tokens.
import cookieParser from 'cookie-parser';// Importa 'cookie-parser', que permite leer y manejar cookies que llegan en las peticiones HTTP.
import usuarioRoutes from './routes/usuarioRoutes.js';// Importa las rutas relacionadas con los usuarios (login, registro, etc.) desde el archivo usuarioRoutes.js
import propiedadesRoutes from './routes/propiedadesRoutes.js';// Importa las rutas relacionadas con las propiedades (crear, editar, eliminar propiedades, etc.)
import appRoutes from './routes/appRoutes.js';// Importa rutas generales de la app (como inicio, página 404, etc.)
import apiRoutes from './routes/apiRoutes.js';// Importa las rutas de la API, normalmente usadas para peticiones AJAX o para apps externas.
import db from './config/db.js';// Importa la configuración de la base de datos (Sequelize para conectarse a MySQL).

//Crear la app
const app=express();

//Habilitr lectura de datos de formularios
app.use(express.urlencoded({extended:true}));

//Habilitar cookie parser
app.use(cookieParser());

//Habilitar CSRF
app.use(csrf({cookie:true}));

//Conexion a la base de datos
try {
    await db.authenticate();
    db.sync()//Crear la tabla en caso de que no este creada
    console.log('Epa')
} catch (error) {
    console.log(error)
}

//Routing
app.use('/',appRoutes);
app.use('/auth',usuarioRoutes);//app.use busca todas las rutas que inicien con '/'
app.use('/',propiedadesRoutes);
app.use('/api',apiRoutes);

//Habilitar Pug
app.set('view engine','pug');//Define que el motor de plantillas que se va a usar es Pug
app.set('views','./views');// Especifica la carpeta donde Express buscará los archivos de vista (Pug). En este caso, será la carpeta llamada 'views' en la raíz del proyecto.

//Carpeta Publica
app.use(express.static('public'))

//Definir un puerto y arrancar el proyecto
const puerto=process.env.PORT || 3000;
app.listen(puerto,()=>{
    console.log('Estoy ready');
})
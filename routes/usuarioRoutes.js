import express from 'express';//Importa Express para poder crear rutas usando Router
import {formularioLogin,
        autenticar,
        cerrarSesion,
        formularioRegistro,
        registrar,confirmar,
        formularioOlvidePassword,
        resetPassword,
        comprobarToken,
        nuevoPassword 
    } from '../controllers/usuarioController.js';//Importamos las funciones del controlador

const router=express.Router();// Crea una instancia de router, que agrupa todas las rutas relacionadas con usuario

router.get('/login',formularioLogin);//Muestra el formulario de login (GET /auth/login).
router.post('/login',autenticar);//Procesa los datos del login y autentica al usuario (POST /auth/login).

router.post('/cerrar-sesion',cerrarSesion)//Cierra la sesión actual del usuario (POST /auth/cerrar-sesion).

router.get('/registro',formularioRegistro);//Muestra el formulario de registro (GET /auth/registro).
router.post('/registrar',registrar);//Procesa el formulario y registra al nuevo usuario en la base de datos (POST /auth/registrar).

router.get('/confirmar/:token',confirmar);//Ruta para confirmar cuenta de usuario mediante un token enviado por email (GET /auth/confirmar/abc123).

router.get('/olvide-password',formularioOlvidePassword);//Muestra el formulario para iniciar recuperación de contraseña.
router.post('/olvide-password',resetPassword);//Procesa la solicitud y envía un email con el token de recuperación.

router.get('/olvide-password/:token',comprobarToken);//Verifica si el token de recuperación es válido
router.post('/olvide-password/:token',nuevoPassword);//Permite asignar una nueva contraseña al usuario

export default router;//Exporta el conjunto de rutas para ser usado en app.js
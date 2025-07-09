import jwt from 'jsonwebtoken' // Importamos la librería jsonwebtoken para verificar el JWT del usuario autenticado
import {Usuario} from '../models/index.js'  // Importamos el modelo Usuario desde el archivo centralizado de modelos (models/index.js)
                                            // Esto permite acceder a la base de datos para validar y obtener información del usuario

const protegerRuta = async (req, res, next) => {

    /***********************************************
    * Verificar si hay un token
    ************************************************/
    const {_token} = req.cookies
    if(!_token) {
        console.log('Token no presente');
        return res.redirect('/auth/login')
    }
    
    /***********************************************
    * Comprobar el Token
    ************************************************/
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET)//Verificamos y decodificamos el token usando la clave secreta definida en las variables de entorno
        console.log('Decoded:', decoded);
        const usuario = await Usuario.scope('eliminarPassword').findByPk(decoded.id)// Buscamos al usuario en la base de datos usando el ID extraído del token
                                                                                    // Usamos el scope 'eliminarPassword' para excluir el campo 'password' de los resultados
        //Si se encontró un usuario válido, lo almacenamos en la petición para usarlo en rutas siguientes
        if(usuario) {
            req.usuario = usuario
        }  else {
            return res.redirect('/auth/login')// Si no se encontró un usuario, redirigimos al login
        }
        return next(); //Pasamos el control al siguiente middleware o controlador
    } catch (error) {
        return res.clearCookie('_token').redirect('/auth/login')// Si el token es inválido o ha expirado, eliminamos la cookie y redirigimos al login
    }
}

export default protegerRuta
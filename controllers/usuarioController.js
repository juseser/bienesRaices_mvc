import {check,validationResult} from 'express-validator';//Importamos las funciones 'check' para definir validaciones y 'validationResult' para obtener los errores de validación
import bcrypt from 'bcrypt'; //Importamos bcrypt para hashear la contraseña en la funcion nuevo password
import Usuario from '../models/Usuario.js';//Importamos el modelo Usuario para poder interactuar con la base de datos (crear, buscar, etc.)
import {generarJWT,generarId} from '../helpers/tokens.js';
import {emailRegistro,emailOlvidePassword} from '../helpers/email.js';

/***********************************************
 *
 * Mostrar Formulario Login
 *
 ***********************************************/
const formularioLogin=(req,res)=>{
    res.render('auth/login',{
        pagina: 'Iniciar Sesión',
        csrfToken: req.csrfToken()
    });
}

/***********************************************
 *
 * Funcionalidad Iniciar Sesion 
 *
 ***********************************************/
const autenticar=async(req,res)=>{
    //Validacion
    await check('email')
        .isEmail()
        .withMessage('Debe ser un email')
        .run(req);
    await check('password')
        .notEmpty()
        .withMessage('El password es obligatorio')
        .run(req);
    let resultado=validationResult(req);

    //Verificar que resultado este vacio
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/login',{
            pagina:'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        })
    }

    /***********************************************
     * Comprobar si el usuario existe
     ***********************************************/
    const {email,password}=req.body;//capturamos los campos
    const usuario=await Usuario.findOne({where:{email}});//Guarda una instancia del modelo Usuario, que representa una fila de la tabla 'usuarios' en la base de datos. Esta instancia incluye los datos del usuario y también métodos como verificarPassword().

    //Si no existe usuario
    if (!usuario) {
        return res.render('auth/login',{
            pagina:'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El usuario no existe'}]
        })
    }

    /***********************************************
     * Comprobar si el usuario esta confirmado
    ***********************************************/
    if(!usuario.confirmado){
        return res.render('auth/login',{
            pagina:'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg:'Tu cuenta no ha sido confirmada'}]
        })
    }

    /***********************************************
    * Revisar el password
    ***********************************************/
    if (!usuario.verificarPassword(password)) {
        return res.render('auth/login',{
            pagina:'Iniciar sesión',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El password es incorrecto'}]
        })
    }

    /***********************************************
    * Autenticar al usuario
    ***********************************************/
    const token = generarJWT({ id: usuario.id, nombre: usuario.nombre })//generamos el token, pasamos un objeto como argumento

    // Guardamos el JWT en una cookie llamada '_token'
    // Esta cookie se usará para identificar al usuario autenticado en futuras peticiones
    return res.cookie('_token',token,{
        // La opción httpOnly hace que la cookie no sea accesible desde JavaScript en el navegador
        // Esto ayuda a prevenir ataques XSS (Cross-Site Scripting)
        httpOnly:true
    }).redirect('/mis-propiedades')// Después de guardar la cookie, redirigimos al usuario a la página de mis propiedades, buscando la ruta en el router
}

/***********************************************
 *
 * Funcionalidad Logout
 *
 ***********************************************/
const cerrarSesion = (req, res) => {
    return res.clearCookie('_token').status(200).redirect('/auth/login')
}

/***********************************************
 *
 * Mostrar Formulario de Registro
 *
 ***********************************************/
const formularioRegistro=(req,res)=>{
    res.render('auth/registro',{ //indicamos la vista que vamos a renderizar
        pagina:'Crear Cuenta', //variable pagina
        csrfToken:req.csrfToken() //función proporcionada por el middleware csurf con la cual generamos el token
    });
}
/***********************************************
 *
 * Registrar Usuario
 *
 ***********************************************/
const registrar=async(req,res)=>{
    /**********************************************************************************************
     * Validaciones: para esto es necesario instalar express-validator y hacer su respectivo import
     **********************************************************************************************/
    await check('nombre')
        .notEmpty()
        .withMessage('El nombre no puede ir vacio')
        .run(req);
    await check('email')
        .isEmail()
        .withMessage('Debe ser un email')
        .run(req);
    await check('password')
        .isLength({min:6})
        .withMessage('El password debe ser de al menos 6 caracteres')
        .run(req);
    await check('repetir_password')
        .custom((value,{req})=>value===req.body.password)
        .withMessage('Los passwords no son iguales')
        .run(req);

    let resultado=validationResult(req);//Obtenemos el resultado de las validaciones del formulario, es un obj de tipo result

    //Verificar que resultado este vacio
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/registro',{//volvemos a mostrar el formulario de registro con sus respectivos errores
            pagina: 'Crear Cuenta',
            csrfToken:req.csrfToken(),
            errores:resultado.array(),//convertimos la variable resultado que es un obj a un array
            //capturamos el nombre y email que vienen desde el req para volverlos a cargar en la caja de texto para que el usuario no los tenga que escribir de nuevo
            usuario:{
               nombre: req.body.nombre,
               email:req.body.email 
            }
        })
    }

    //Extraer datos
    const {nombre,email,password}=req.body;

    //Verificar que el usuario no este duplicado
    const existeUsuario=await Usuario.findOne({where:{email}});
    if (existeUsuario) {
        return res.render('auth/registro',{
            pagina:'Crear Cuenta',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El Usuario ya esta registrado'}],
            usuario:{
                nombre,
                email
            }
        })
    }

    //Almacenar un usuario
    const usuario=await Usuario.create({
        nombre,
        email,
        password,
        token:generarId()//token para confirmar la cuenta
    });

    //Enviar email de confirmacion, pasamos un obj como parametro a la funcion emailRegistro que esta en el helper
    emailRegistro({
        nombre:usuario.nombre,
        email:usuario.email,
        token:usuario.token
    })
    //Mostrar mensaje de confirmacion
    res.render('templates/mensaje',{
        pagina:'Cuenta Creada Correctamente',
        mensaje:'Hemos enviado un correo de confirmación, presiona en el enlace'
    })
}

/***********************************************
 *
 * Funcion para confirmar la cuenta
 *
 ***********************************************/
const confirmar=async (req,res)=>{
    const {token}=req.params;

    //Verificar si el token es valido
    const usuario=await Usuario.findOne({where:{token}});

    if (!usuario) {
        return res.render('auth/confirmar-cuenta',{
            pagina:'Error al confirmar tu cuenta',
            mensaje:'Hubo un error al confirmar tu cuenta, intenta de nuevo',
            error:true
        })
    }

    //Confirmar la cuenta
    usuario.token=null;
    usuario.confirmado=true;
    await usuario.save();
    res.render('auth/confirmar-cuenta',{
        pagina:'Cuenta Confirmada',
        mensaje:'La cuenta se confirmo correctamente'
    })
}

/***********************************************
 *
 * Mostrar Formulario Olvide Password
 *
 ***********************************************/
const formularioOlvidePassword=(req,res)=>{
    res.render('auth/olvide-password',{ //vamos directamente a la vista
        pagina:'Recupera tu acceso a Bienes Raices',
        csrfToken:req.csrfToken()
    })
}

/***********************************************
 *
 * Cambiar password
 *
 ***********************************************/
const resetPassword=async(req,res)=>{
    /***********************************************
     * Validacion
     ***********************************************/
    await check('email')
        .isEmail()
        .withMessage('Debe ser un email')
        .run(req);
    
    let resultado=validationResult(req);

    /***********************************************
     * Si hay errores
     ***********************************************/
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/olvide-password',{ //mandamos de nuevo al formulario para ingresar el nuevo password
            pagina:'Recupera tu acceso a Bienes Raices',
            csrfToken:req.csrfToken(),
            errores:resultado.array()
        })
    }

    /***********************************************
     * Buscar el usuario
     ***********************************************/
    const {email}=req.body;
    const usuario=await Usuario.findOne({where:{email}});
    
    //Si no existe un usuario con ese email
    if(!usuario){
        return res.render('auth/olvide-password',{
            pagina: 'Recupera tu acceso a Bienes Raices',
            csrfToken:req.csrfToken(),
            errores:[{msg:'El email no pertenece a ningun usuario'}]
        })
    }

    //Generar un token y enviar el email si se encontro el usuario
    usuario.token=generarId();//asignamos el nuevo token al usuario
    await usuario.save();//guardamos los cambios

    //Enviar email
    emailOlvidePassword({
        email:usuario.email,
        nombre:usuario.nombre,
        token:usuario.token
    })

    //Renderizar un mensaje
    res.render('templates/mensaje',{
        pagina:'Reestablece tu password',
        mensaje:'Hemos enviado un email con las instrucciones'
    })
}

/***********************************************
 *
 * Comprobar token
 *
 ***********************************************/
const comprobarToken=async(req,res)=>{
    const {token}=req.params;

    const usuario=await Usuario.findOne({where:{token}});
    if(!usuario){
        return res.render('auth/confirmar-cuenta',{
            pagina:'Reestablece tu password',
            mensaje:'Hubo un error al validar tu informacion, intenta de nuevo',
            error:true
        })
    }

    //Mostrar formulario para modificar password
    res.render('auth/reset-password',{
        pagina:'Reestablece tu password',
        csrfToken:req.csrfToken()
    })
}

/***********************************************
 *
 * Guardar nuevo password
 *
 ***********************************************/
const nuevoPassword=async(req,res)=>{
    //Validar el password
    await check('password')
        .isLength({min:6})
        .withMessage('El password debe ser de al menos 6 caracteres')
        .run(req);

    //Verificar que el resultado este vacio
    let resultado=validationResult(req);
    //Verificar que resultado este vacio
    if (!resultado.isEmpty()) {
        //Errores
        return res.render('auth/reset-password',{
            pagina: 'Reestablece tu password',
            csrfToken:req.csrfToken(),
            errores:resultado.array(),
        })
    }

    const {token}=req.params;
    const {password}=req.body;

    //Identificar quien hace el cambio
    const usuario=await Usuario.findOne({where:{token}})

    //Hashear el nuevo password
    const salt=await bcrypt.genSalt(10);
    usuario.password=await bcrypt.hash(password,salt);
    usuario.token=null;

    await usuario.save();

    res.render('auth/confirmar-cuenta',{
        pagina:'Password reestablecido',
        mensaje:'El password se guardo correctamente'
    })
}

export {
    formularioLogin,
    autenticar,
    cerrarSesion,
    formularioRegistro,
    registrar,
    confirmar,
    formularioOlvidePassword,
    resetPassword,
    comprobarToken,
    nuevoPassword
}
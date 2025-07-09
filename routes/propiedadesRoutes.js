import express from 'express'; // Importa el módulo de Express para crear rutas
import {body} from 'express-validator';// Importa la función 'body' de express-validator para validar datos del formulario
import {
        admin,
        crear,
        guardar,
        agregarImagen,
        almacenarImagen,
        editar,
        guardarCambios,
        eliminar,
        cambiarEstado,
        mostrarPropiedad,
        enviarMensaje,
        verMensajes
    } from '../controllers/propiedadController.js'; // Importa los controladores relacionados con propiedades
import protegerRuta from '../middleware/protegerRuta.js';// Middleware para proteger rutas que requieren autenticación
import upload from '../middleware/subirImagen.js';// Middleware para manejar la subida de imágenes
import identificarUsuario from '../middleware/identificarUsuario.js';// Middleware que identifica si hay un usuario autenticado (usado para vistas públicas)

const router=express.Router();

router.get('/mis-propiedades',protegerRuta,admin); //mostrar vista admin
router.get('/propiedades/crear',protegerRuta,crear);//Mostrar form para crear propiedades

/***********************************************
 * Crear propiedad
 ***********************************************/
router.post('/propiedades/crear',
    protegerRuta,
    body('titulo').notEmpty().withMessage('El titulo del anuncio es obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La Descripción no puede ir vacia')
        .isLength({ max: 200 }).withMessage('La Descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona un rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la Cantidad de Habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la Cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la Cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
    guardar
);

/***********************************************
 * Mostrar formulario para agregar imagen
 ***********************************************/
router.get('/propiedades/agregar-imagen/:id', 
    protegerRuta,
    agregarImagen
)

/***********************************************
 * Guardar una imagen
 ***********************************************/
router.post('/propiedades/agregar-imagen/:id',
    protegerRuta,
    upload.single('imagen'),
    almacenarImagen
)

/***********************************************
 *
 * Mostrar formulario editar
 *
 ***********************************************/
router.get('/propiedades/editar/:id', 
    protegerRuta,
    editar
)

/***********************************************
 *
 * Editar propiedad
 *
 ***********************************************/
router.post('/propiedades/editar/:id', 
    protegerRuta,
    body('titulo').notEmpty().withMessage('El Titulo del Anuncio es Obligatorio'),
    body('descripcion')
        .notEmpty().withMessage('La Descripción no puede ir vacia')
        .isLength({ max: 200 }).withMessage('La Descripción es muy larga'),
    body('categoria').isNumeric().withMessage('Selecciona una categoría'),
    body('precio').isNumeric().withMessage('Selecciona un rango de Precios'),
    body('habitaciones').isNumeric().withMessage('Selecciona la Cantidad de Habitaciones'),
    body('estacionamiento').isNumeric().withMessage('Selecciona la Cantidad de Estacionamientos'),
    body('wc').isNumeric().withMessage('Selecciona la Cantidad de Baños'),
    body('lat').notEmpty().withMessage('Ubica la Propiedad en el Mapa'),
    guardarCambios
)

/***********************************************
 *
 * Eliminar propiedad
 *
 ***********************************************/
router.post('/propiedades/eliminar/:id', 
    protegerRuta,
    eliminar
)

/***********************************************
 *
 * Cambiar estado
 *
 ***********************************************/
router.put('/propiedades/:id', 
    protegerRuta,
    cambiarEstado
)

// Area Publica
router.get('/propiedad/:id',
    identificarUsuario,
    mostrarPropiedad
)

// Almacenar los mensajes
router.post('/propiedad/:id',
    identificarUsuario,
    body('mensaje').isLength({min: 20}).withMessage('El Mensaje no puede ir vacio o es muy corto'),
    enviarMensaje
)

router.get('/mensajes/:id', 
    protegerRuta,
    verMensajes
)

export default router;
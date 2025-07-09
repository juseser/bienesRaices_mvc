import {unlink} from 'node:fs/promises';// Importamos la función unlink desde el módulo nativo 'fs/promises' de Node.js. Esta función permite eliminar archivos del sistema de archivos usando async/await
import {validationResult} from 'express-validator';// Importamos validationResult desde express-validator. Esta función recoge los errores generados por las validaciones aplicadas al request (req)
import {Precio,Categoria,Propiedad,Mensaje,Usuario} from '../models/index.js';
import {esVendedor,formatearFecha} from '../helpers/index.js';

/***********************************************
 *
 * Funcionalidad mostrar mis propiedades
 *
 ***********************************************/
const admin=async(req,res)=>{

    // Extraemos el valor de "pagina" del query string (?pagina=2 por ejemplo)
    // y lo renombramos como "paginaActual"
    const {pagina: paginaActual} = req.query
    
    const expresion = /^[1-9]$/ // Creamos una expresión regular para validar que "paginaActual" sea un número del 1 al 9 (esto puede ajustarse si se necesitan más páginas)

    // Si "paginaActual" no pasa la validación (es undefined, vacío, 0, etc.),
    // redirigimos a la primera página por defecto
    if(!expresion.test(paginaActual)) {
        return res.redirect('/mis-propiedades?pagina=1')
    }

    try {
        const {id} = req.usuario // Extraemos el ID del usuario autenticado desde el request

        const limit = 10 // Definimos cuántas propiedades mostrar por página
        const offset = ((paginaActual * limit) - limit) // Calculamos el offset para saber desde qué registro empezar a consultar
                                                        // Ej: Si paginaActual = 2 → offset = (2 * 10) - 10 = 10 (empezamos desde el 11° registro)

        // Ejecutamos ambas consultas al mismo tiempo usando Promise.all:
        // 1. Traemos las propiedades de ese usuario con paginación
        // 2. Contamos cuántas propiedades tiene en total (sin paginación)                                              
        const [propiedades, total] = await Promise.all([
            Propiedad.findAll({
                limit, //registros a traer
                offset, //registros a omitir
                where: {
                    usuarioId : id
                },
                include: [
                    { model: Categoria, as: 'categoria' },//Por cada propiedad, tráeme la categoría asociada usando la relación que definí con el alias 'categoria'
                    { model: Precio, as: 'precio' },
                    { model: Mensaje, as: 'mensajes' }
                ],
            }),
            Propiedad.count({
                where: {
                    usuarioId : id
                }
            })
        ])

        res.render('propiedades/admin', { //va directamente a la vista sin pasar por el router
            pagina: 'Mis Propiedades',
            propiedades,
            csrfToken: req.csrfToken(),
            paginas: Math.ceil(total / limit),
            paginaActual: Number(paginaActual),
            total,
            offset,
            limit
        })

    } catch (error) {
        console.log(error)
    }
}

/***********************************************
 *
 * Mostrar formulario para crear propiedad
 *
 ***********************************************/
const crear = async (req, res) => {
    // Consultar Modelo de Precio y Categorias para pasarlo a la vista
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/crear', {
        pagina: 'Crear Propiedad',
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: {}
    })
}

/***********************************************
 *
 * Crear una propiedad
 *
 ***********************************************/
const guardar = async (req, res) => {

    // Validación
    let resultado = validationResult(req)
    
    //Si hay errores
    if(!resultado.isEmpty()) {

        // Consultar Modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/crear', {
            pagina: 'Crear Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios, 
            errores: resultado.array(),
            datos: req.body//pasamos los datos que ya habia ingresado el usuario para que no los tenga que escribir de nuevo
        })
    }

    // Crear un Registro
    const {titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId} = req.body

    const {id: usuarioId} = req.usuario//El middleware protegerRuta ya colocó el usuario autenticado en req.usuario
  
    try {
        const propiedadGuardada = await Propiedad.create({
            titulo,
            descripcion,
            habitaciones, 
            estacionamiento, 
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId,
            usuarioId,
            imagen: ''
        })

        const {id} = propiedadGuardada

        res.redirect(`/propiedades/agregar-imagen/${id}`) //buscamos la ruta en el routes para mostrar el form de agregar imagen

    } catch (error) {
        console.log(error)
    }
}

/***********************************************
 *
 * Mostrar formulario para guardar imagen
 *
 ***********************************************/
const agregarImagen = async (req, res) => {

    const {id} = req.params//id de la propiedad

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    //Si no existe, redirigimos a mis propiedades
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenece a quien visita esta página
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ) {
        return res.redirect('/mis-propiedades')
    }
    
    res.render('propiedades/agregar-imagen', {
        pagina: `Agregar Imagen: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        propiedad
    })
}

/***********************************************
 *
 * Guardar imagen
 *
 ***********************************************/
const almacenarImagen = async (req, res, next) => {

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad no este publicada
    if(propiedad.publicado) {
        return res.redirect('/mis-propiedades')
    }

    // Validar que la propiedad pertenece a quien visita esta página
    if( req.usuario.id.toString() !== propiedad.usuarioId.toString() ) {
        return res.redirect('/mis-propiedades')
    }

    try {
        // Almacenar la imagen y publicar propiedad
        propiedad.imagen = req.file.filename //guardamos el nombre de la imagen
        propiedad.publicado = 1//publicamos la propiedad

        await propiedad.save()//guardamos los cambios

        next()//como no termina con un render o redirect se utiliza next

    } catch (error) {
        console.log(error)
    }
}

/***********************************************
 *
 * Mostrar formulario editar
 *
 ***********************************************/
const editar = async (req, res) => {

    const {id} = req.params//id de la propiedad que viene en la url

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    //Si no existe
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URl, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString() ) {
        return res.redirect('/mis-propiedades')
    }

    // Consultar Modelo de Precio y Categorias
    const [categorias, precios] = await Promise.all([
        Categoria.findAll(),
        Precio.findAll()
    ])

    res.render('propiedades/editar', {
        pagina: `Editar Propiedad: ${propiedad.titulo}`,
        csrfToken: req.csrfToken(),
        categorias,
        precios,
        datos: propiedad
    })
}

/***********************************************
 *
 * Editar propiedad
 *
 ***********************************************/

const guardarCambios = async (req, res ) => {
    
    // Verificar la validación
    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {

        // Consultar Modelo de Precio y Categorias
        const [categorias, precios] = await Promise.all([
            Categoria.findAll(),
            Precio.findAll()
        ])

        return res.render('propiedades/editar', {
            pagina: 'Editar Propiedad',
            csrfToken: req.csrfToken(),
            categorias,
            precios,
            errores: resultado.array(),
            datos: req.body
        })
    }

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URl, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString() ) {
        return res.redirect('/mis-propiedades')
    }

    // Reescribir el objeto y actualizarlo
    try {

        const { titulo, descripcion, habitaciones, estacionamiento, wc, calle, lat, lng, precio: precioId, categoria: categoriaId } = req.body

        propiedad.set({
            titulo,
            descripcion,
            habitaciones,
            estacionamiento,
            wc,
            calle,
            lat,
            lng,
            precioId,
            categoriaId
        })
        
        await propiedad.save();

        res.redirect('/mis-propiedades')
        
    } catch (error) {
        console.log(error)
    }

}

/***********************************************
 *
 * Eliminar propiedad
 *
 ***********************************************/
const eliminar = async (req, res) => {
    
    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id)
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URl, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString() ) {
        return res.redirect('/mis-propiedades')
    }

    // Eliminar la imagen
    await unlink(`public/uploads/${propiedad.imagen}`)
    console.log(`Se eliminó la imagen ${propiedad.imagen}`)

    // Eliminar la propiedad
    await propiedad.destroy()
    res.redirect('/mis-propiedades')
}

/***********************************************
 *
 * Modifica el estado de la propiedad
 *
 ***********************************************/
const cambiarEstado = async (req, res) => {

    const {id} = req.params

    
    const propiedad = await Propiedad.findByPk(id) //buscamos la propiedad

    //si no existe
    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URl, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString() ) {
        return res.redirect('/mis-propiedades')
    }

    // Actualizar
    propiedad.publicado = !propiedad.publicado //si es true lo cambia a false y viceversa, le estoy diciendo que propidad.publicado sera igual a su opuesto y eso lo hago con !

    await propiedad.save()//guardamos los cambios
    
    //mandamos la respuesta en formato json
    res.json({
        resultado: true
    })
}

// Muestra una propiedad
const mostrarPropiedad = async (req, res) => {
    const {id} = req.params

    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include : [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria', scope: 'eliminarPassword' },
        ]
    })

    if(!propiedad || !propiedad.publicado) {
        return res.redirect('/404')
    }

    res.render('propiedades/mostrar', {
        propiedad,
        pagina: propiedad.titulo,
        csrfToken: req.csrfToken(),
        usuario: req.usuario,
        esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId )
    })
}

const enviarMensaje = async (req, res) => {
    const {id} = req.params

    // Comprobar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include : [
            { model: Precio, as: 'precio' },
            { model: Categoria, as: 'categoria' },
        ]
    })

    if(!propiedad) {
        return res.redirect('/404')
    }

    // Renderizar los errores
        // Validación
    let resultado = validationResult(req)

    if(!resultado.isEmpty()) {

        return res.render('propiedades/mostrar', {
            propiedad,
            pagina: propiedad.titulo,
            csrfToken: req.csrfToken(),
            usuario: req.usuario,
            esVendedor: esVendedor(req.usuario?.id, propiedad.usuarioId ),
            errores: resultado.array()
        })
    }
    const {mensaje} = req.body
    const {id: propiedadId} = req.params
    const {id: usuarioId} = req.usuario

    // Almacenar el mensaje
    await Mensaje.create({
        mensaje,
        propiedadId,
        usuarioId
    })

    res.redirect('/')
}

// Leer mensajes recibidos
const verMensajes = async (req, res) => {

    const {id} = req.params

    // Validar que la propiedad exista
    const propiedad = await Propiedad.findByPk(id, {
        include: [
            { model: Mensaje, as: 'mensajes', 
                include: [
                    {model: Usuario.scope('eliminarPassword'), as: 'usuario'}
                ]
            },
        ],
    })

    if(!propiedad) {
        return res.redirect('/mis-propiedades')
    }

    // Revisar que quien visita la URl, es quien creo la propiedad
    if(propiedad.usuarioId.toString() !== req.usuario.id.toString() ) {
        return res.redirect('/mis-propiedades')
    }

    res.render('propiedades/mensajes', {
        pagina: 'Mensajes',
        mensajes: propiedad.mensajes,
        formatearFecha
    })
}

export{
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
}
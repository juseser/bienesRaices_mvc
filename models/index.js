// Importamos todos los modelos definidos en archivos separados
import Propiedad from './Propiedad.js'
import Precio from './Precio.js'
import Categoria from './Categoria.js'
import Usuario from './Usuario.js'
import Mensaje from './Mensaje.js'

/***********************************************
 *
 * Definimos las relaciones entre los modelos
 *
 ***********************************************/
Propiedad.belongsTo(Precio, {foreignKey: 'precioId'})// Una Propiedad pertenece a un Precio (relación muchos a uno)
Propiedad.belongsTo(Categoria, {foreignKey: 'categoriaId'})// Una Propiedad pertenece a una Categoría
Propiedad.belongsTo(Usuario, { foreignKey: 'usuarioId'})// Una Propiedad pertenece a un Usuario (quien la publicó)
Propiedad.hasMany(Mensaje, {foreignKey: 'propiedadId'})// Una Propiedad puede tener muchos Mensajes

Mensaje.belongsTo(Propiedad, {foreignKey: 'propiedadId'})// Un Mensaje pertenece a una Propiedad
Mensaje.belongsTo(Usuario, {foreignKey: 'usuarioId'})// Un Mensaje pertenece a un Usuario (el que lo envió)

export {
    Propiedad,
    Precio,
    Categoria,
    Usuario, 
    Mensaje
}
import {DataTypes} from 'sequelize';//Importamos DataTypes para definir los tipos de datos de los campos en Sequelize
import bcrypt from 'bcrypt';//Importamos bcrypt para encriptar las contraseñas
import db from '../config/db.js';//Importamos la instancia de conexión a la base de datos

/********************************************************************
 *
 * Definimos el modelo 'Usuario' y lo asociamos a la tabla 'usuarios'
 *
 ********************************************************************/
const Usuario=db.define('usuarios',{
    nombre:{
        type:DataTypes.STRING,
        allowNull:false
    },
    email:{
        type:DataTypes.STRING,
        allowNull:false
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false
    },
    token:DataTypes.STRING,
    confirmado:DataTypes.BOOLEAN
},{
    //Hooks = funciones que se ejecutan automáticamente en eventos del modelo
    hooks:{
        //Antes de crear un usuario, encriptamos su contraseña
        beforeCreate:async(usuario)=>{
            const salt=await bcrypt.genSalt(10)
            usuario.password=await bcrypt.hash(usuario.password,salt)
        }
    },
    //Scopes = filtros predefinidos para consultas
    scopes: {
        //Scope para eliminar campos sensibles cuando se obtienen usuarios
        eliminarPassword: {
            attributes: {
                exclude: ['password', 'token', 'confirmado', 'createdAt', 'updatedAt']
            }
        }
    }
})

//Método personalizado para verificar si una contraseña ingresada coincide con la almacenada (encriptada)
Usuario.prototype.verificarPassword=function(password){
    return bcrypt.compareSync(password,this.password);
}

export default Usuario;
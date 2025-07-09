# Bienes Raíces 🏘️

Este proyecto es una aplicación web desarrollada con Node.js bajo el patrón MVC. Permite publicar, administrar y visualizar propiedades inmobiliarias con funcionalidades completas de autenticación, envío de correos, carga de imágenes, mapas interactivos y más. Fue creado con fines de aprendizaje práctico y consolidación de conocimientos en desarrollo backend, bases de datos y despliegue web.

## 🌐 Enlace en Producción

Próximamente...

## 📁 Estructura del Proyecto

```
bienesRaices_mvc/
├── config/
├── controllers/
│   ├── apiController.js
│   ├── appController.js
│   ├── propiedadController.js
│   └── usuarioController.js
├── helpers/
│   ├── email.js
│   ├── index.js
│   └── tokens.js
├── middleware/
│   ├── identificarUsuario.js
│   ├── protegerRuta.js
│   └── subirImagen.js
├── models/
│   ├── Categoria.js
│   ├── index.js
│   ├── Mensaje.js
│   ├── Precio.js
│   ├── Propiedad.js
│   └── Usuario.js
├── node_modules/
├── public/
│   ├── css/
│   │   ├── app.css
│   │   └── tailwind.css
│   ├── img/
│   └── js/
│       ├── agregarImagen.js
│       ├── cambiarEstado.js
│       ├── mapa.js
│       ├── mapainicio.js
│       └── mostrarMapa.js
├── routes/
│   ├── apiRoutes.js
│   ├── appRoutes.js
│   ├── propiedadesRoutes.js
│   └── usuarioRoutes.js
├── seed/
│   ├── categorias.js
│   ├── precios.js
│   ├── seeder.js
│   └── usuarios.js
├── src/js/
│   ├── agregarImagen.js
│   ├── cambiarEstado.js
│   ├── mapa.js
│   ├── mapainicio.js
│   └── mostrarMapa.js
├── uploads/
├── views/
├── .env
├── .gitignore
├── app.js
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── webpack.config.js
└── README.md
```

## 🛠️ Tecnologías Usadas

- Node.js
- Express
- Sequelize (ORM)
- MySQL
- Pug (motor de plantillas)
- Tailwind CSS
- JavaScript
- Multer (para subir imágenes)
- JWT (para autenticación)
- Nodemailer (para envío de correos)
- Brevo (SMTP)
- Mapbox (mapas)
- Dotenv
- Webpack

## 🎯 Propósito del Proyecto

Este proyecto fue desarrollado con los siguientes fines:

- Aprender y aplicar el patrón MVC en Node.js.
- Practicar el uso de ORMs y la manipulación de bases de datos relacionales.
- Implementar autenticación de usuarios con JWT y CSRF.
- Enviar correos de confirmación de cuenta y recuperación de contraseña con Brevo.
- Manejar carga de imágenes con Multer.
- Incorporar mapas interactivos mediante Mapbox.
- Aplicar conceptos de despliegue y preparación para producción.
- Consolidar habilidades backend desarrollando una app realista desde cero.

## 📌 Notas

- El proyecto aún no está desplegado, pero está listo para ser publicado en plataformas como Railway o Render.
- Se empleó Mailtrap en etapa de desarrollo y Brevo para envío de correos reales.

## 🧾 Licencia

Este proyecto es de uso libre para fines educativos y personales.

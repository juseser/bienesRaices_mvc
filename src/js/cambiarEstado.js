// Encerramos todo el código en una IIFE (función autoejecutable) para evitar contaminar el scope global
(function() {
   
    const cambiarEstadoBotones = document.querySelectorAll('.cambiar-estado') // Seleccionamos todos los botones que tienen la clase .cambiar-estado
    const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')// Obtenemos el token CSRF del meta tag que está en el head del HTML
    
    // Recorremos todos los botones encontrados y les agregamos un event listener para el evento 'click'
    cambiarEstadoBotones.forEach( boton => {
        boton.addEventListener('click', cambiarEstadoPropiedad)
    } )

    // Esta es la función que se ejecuta cuando se hace clic en uno de los botones
    async function cambiarEstadoPropiedad(e) {

        const {propiedadId: id} = e.target.dataset// Extraemos el ID de la propiedad desde el atributo data-propiedad-id del botón clickeado
        
        try {
            const url = `/propiedades/${id}` // Armamos la URL a la que vamos a hacer la petición PUT

             // Hacemos la petición usando fetch con el método PUT
            const respuesta = await fetch(url, {
                method: 'PUT',
                headers: {
                    'CSRF-Token': token
                }
            })

            const {resultado} = await respuesta.json() // Esperamos la respuesta del servidor y la convertimos a JSON

            //resultado retorna true o false
            if(resultado) {
                if(e.target.classList.contains('bg-yellow-100')) {
                    e.target.classList.add('bg-green-100', 'text-green-800')
                    e.target.classList.remove('bg-yellow-100', 'text-yellow-800')
                    e.target.textContent = 'Publicado'
                } else {
                    e.target.classList.remove('bg-green-100', 'text-green-800')
                    e.target.classList.add('bg-yellow-100', 'text-yellow-800')
                    e.target.textContent = 'No Publicado'
                }
            }
        } catch (error) {
            console.log(error)
        }
       
    }
})()
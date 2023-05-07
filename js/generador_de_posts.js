function printDatosPost() {
    console.log(generarPost());
}

// CAMBIAR EL NOMBRE POR ALGO MAS DESCRIPTIVO
// Esta Funcion crea y retorna un objeto con toda la informacion necesaria para un post
async function generarPost() {

    // Se crea un objeto "vacio" para evitar problemas con 'return'
    var datos_post = {
        nombre: 'Nombre',
        apellido: 'Apellido',
        raza_perro: '',
        img_perfil: '',
        ciudad: 'Ciudad',
        pais: 'País',
        temperatura: '-',
        img_perro: ''
    };

    // (nombre, apellido, img_perfil, ciudad, pais)
    // 1) La primera API en ser consultada nos da la información del usuario falso.
    await obtenerDatosRandomUserAPI().done(function (response) {
        datos_post['nombre'] = response.results[0].name.first;
        datos_post['apellido'] = response.results[0].name.last;

        datos_post['img_perfil'] = response.results[0].picture.thumbnail;


        datos_post['ciudad'] = response.results[0].location.city;
        datos_post['pais'] = response.results[0].location.country;

        // console.log("Random Userr API:")
        // console.log(datos_post)
    }).fail(function (error) {
        console.log('Error Random User API:', error);
    });


    // (temperatura)
    // 2) Es importante la API del clima sea consultada despues de Random User, se necesita una ciudad para poder consultar la temperatura
    await obtenerDatosWeahterAPI(datos_post['ciudad']).done(function (response) {
        datos_post['temperatura'] = response.current.temp_c + "°";

        // console.log("Weather API:");
        // console.log(datos_post)
    }).fail(function (error) {
        console.log('Error Weather API:', error);
        datos_post['temperatura'] = '-';
    });


    // (temperatura)
    // 3) Por ultimo buscamos una foto de un perro, esta API podria ser llamada en cualquier punto, pero decidi dejarla para el final
    // Aqui ademas extraeremos la raza del perro desde la URL que nos entrega la API, es más facil hacerlo asi
    await obtenerDatosDogAPI().done(function (response) {
        // Extrae la raza del perro de la URL
        const url = response.message;
        const regex = /breeds\/(.+?)\//;
        const match = url.match(regex);
        const raza = match[1];


        datos_post['img_perro'] = response.message;
        datos_post['raza_perro'] = raza;


        // console.log("Dog API:");
        // console.log(datos_post);
    }).fail(function (error) {
        console.log('Error Dog API:', error);
    });



    return datos_post;
}






// Gracias ChatGPT
// No entiendo como funcionan pero estas funciones son las que realmente hacen la llamada a las APIs
function obtenerDatosRandomUserAPI() {
    return $.ajax({
        url: 'https://randomuser.me/api/1.3/?nat=gb,us,au,ca&noinfo',
        method: 'GET',
        dataType: 'json'
    });
}
function obtenerDatosDogAPI() {
    return $.ajax({
        url: 'https://dog.ceo/api/breeds/image/random',
        method: 'GET',
        dataType: 'json'
    });
}
function obtenerDatosWeahterAPI(ciudad) {
    return $.ajax({
        url: 'https://api.weatherapi.com/v1/current.json?key=dcf3e5f1708e48f18e472023230605&q=' + ciudad,
        method: 'GET',
        dataType: 'json'
    });
}


function crearCartas(cantidad) {
    for (let i = 1; i < cantidad+1; i++) {
        console.log("carta numero: " + i);
        try {  
            crearCarta();
        } catch (error) {
            console.log("error en carta numero:" + i)
        }
    }
}


async function crearCarta() {
    datos_post = await generarPost();

    url_img_perfil = datos_post['img_perfil'];
    nombre = datos_post['nombre'];
    apellido = datos_post['apellido'];
    raza_perro = datos_post['raza_perro'];

    descripcion = "";
    img_perro = datos_post['img_perro'];

    ciudad = datos_post['ciudad'];
    pais = datos_post['pais'];
    temperatura = datos_post['temperatura'];


    var carta = "";
    carta += '<div class="card text-bg-dark rounded-4 shadow-lg border-0 mx-auto mb-5" style="max-height: 50rem;">'
    carta += '<div class="card-body px-4 pt-4 pb-1">'
    carta += '<div class="px-2 pb-4">'
    carta += '<div class="d-flex gap-3 pb-2">'
    carta += '<div>'
    carta += '<img src="' + url_img_perfil + '" class="rounded-circle shadow-lg ratio ratio-1x1"'
    carta += 'Style="width: 3rem;" alt="Perfil">'
    carta += '</div>'
    carta += '<div class="d-flex my-auto">'
    carta += '<h5 class="card-title fw-bold fs-4 text-capitalize">' + nombre + " " + apellido + ' · ' + raza_perro + '</h5>'
    carta += '</div>'
    carta += '</div>'
    carta += '<p class="card-text fw-semibold fs-5">'+ descripcion +'</p>'
    carta += '</div>'
    carta += '<div>'
    carta += '<div>'
    carta += '<img src="' + img_perro + '" class="card-img-bottom rounded-4 shadow-lg" style="max-height: 40rem"'
    carta += 'alt="' + raza_perro + '">'
    carta += '</div>'
    carta += '</div>'
    carta += '<div class="px-2 py-1">'
    carta += '<span class="card-title fw-lighter fs-6 text-capitalize">' + ciudad + ", " + pais + " | " + temperatura + '</span>'
    carta += '</div>'
    carta += '</div>'
    carta += '</div>'
    $("#posts").append(carta);
}

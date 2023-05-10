// CAMBIAR EL NOMBRE POR ALGO MAS DESCRIPTIVO?
// Esta Funcion crea y retorna un objeto con toda la informacion necesaria para un post
async function generar_post() {
    // Se crea un objeto "vacio" para evitar problemas con 'return'

    var datos_post = {
        img_perfil: "",
        nombre: "",
        apellido: "",
        raza_perro: "",

        descripcion: "",
        img_perro: "",

        ciudad: "",
        pais: "",
        temperatura: "",
    };

    // (nombre, apellido, img_perfil, ciudad, pais)
    // 1) La primera API en ser consultada nos da la información del usuario falso.
    try {
        await obtener_datos_randomuserAPI()
            .done(function (response) {
                datos_post.nombre = response.results[0].name.first;
                datos_post.apellido = response.results[0].name.last;

                datos_post.img_perfil = response.results[0].picture.thumbnail;

                datos_post.ciudad = response.results[0].location.city;
                datos_post.pais = response.results[0].location.country;

                // console.log("Random Userr API:")
                // console.log(datos_post)
            })
            .fail(function () {});
    } catch {
        throw new Error("Catch(RandomUserAPI)");
    }

    // (temperatura)
    // 2) Es importante la API del clima sea consultada despues de Random User, se necesita una ciudad para poder consultar la temperatura
    try {
        await obtener_datos_weatherAPI(datos_post.ciudad)
            .done(function (response) {
                datos_post.temperatura = response.current.temp_c;

                // console.log("Weather API:");
                // console.log(datos_post)
            })
            .fail(function () {});
    } catch {
        throw new Error("Catch(WeatherAPI)");
    }

    // (temperatura)
    // 3) Por ultimo buscamos una foto de un perro, esta API podria ser llamada en cualquier punto, pero decidi dejarla para el final
    // Aqui ademas extraeremos la raza del perro desde la URL que nos entrega la API, es más facil hacerlo asi
    try {
        await obtener_datos_dogAPI()
            .done(function (response) {
                // Extrae la raza del perro de la URL
                const url = response.message;
                const regex = /breeds\/(.+?)\//;
                const match = url.match(regex);
                const raza = match[1];

                datos_post.img_perro = response.message;
                datos_post.raza_perro = raza;

                // console.log("Dog API:");
                // console.log(datos_post);
            })
            .fail(function () {});
    } catch {
        throw new Error("Catch(DogAPI)");
    }

    return datos_post;
}

// No entiendo como funcionan pero estas funciones son las que realmente hacen la llamada a las APIs
function obtener_datos_randomuserAPI() {
    return $.ajax({
        url: `https://randomuser.me/api/?inc=name,location,picture&noinfo`,
        method: "GET",
        dataType: "json",
    });
}
function obtener_datos_dogAPI() {
    return $.ajax({
        url: `https://dog.ceo/api/breeds/image/random`,
        method: "GET",
        dataType: "json",
    });
}
function obtener_datos_weatherAPI(ciudad) {
    return $.ajax({
        url: `https://api.weatherapi.com/v1/current.json?key=dcf3e5f1708e48f18e472023230605&q=${ciudad}`,
        method: "GET",
        dataType: "json",
    });
}

async function spawn_cartas(cantidad) {
    for (let i = 1; i < cantidad + 1; i++) {
        try {
            await crear_carta();
        } catch (error) {
            if (error.message == "Error(CreandoCarta)") {
                // Se resta 1 al iterador (haciendo que se repita la creación de la carta) para que la cantidad total de cartas sea la esperada
                i--;
            }
        }
    }
}

async function crear_carta() {
    try {
        datos_post = await generar_post();
    } catch (error) {
        if (error.message == "Catch(RandomUserAPI)") {
            throw new Error("Error(CreandoCarta)");
        } else if (error.message == "Catch(WeatherAPI)") {
            throw new Error("Error(CreandoCarta)");
        } else if (error.message == "Catch(WeatherAPI)") {
            throw new Error("Error(CreandoCarta)");
        }
    }

    // console.table(datos_post);

    const {
        img_perfil,
        nombre,
        apellido,
        raza_perro,
        descripcion,
        img_perro,
        ciudad,
        pais,
        temperatura,
    } = datos_post;

    var carta = `
    <div class="card text-bg-dark rounded-4 shadow-lg border-0 mx-auto mb-5">
        <div class="card-body px-4 pt-4 pb-1">
            <div class="px-2 pb-4">
                <div class="d-flex gap-3 pb-2">
                    <div>
                        <img src="${img_perfil}" class="rounded-circle shadow-lg ratio ratio-1x1" Style="width: 3rem;" alt="Perfil">
                    </div>
                    <div class="d-flex my-auto">
                        <h5 class="card-title fw-bold fs-4 text-capitalize" style="user-select: none;">
                            ${nombre} ${apellido} · ${raza_perro}
                        </h5>
                    </div>
                </div>
                <p class="card-text fw-semibold fs-5">${descripcion}</p>
            </div>
            <div>
                <div>
                    <img src="${img_perro}" class="card-img-bottom rounded-4 shadow-lg" alt="${raza_perro}">
                </div>
            </div>
            <div class="px-2 py-1">
                <span class="card-title fw-lighter fs-6 text-capitalize" style="user-select: none;">
                    ${ciudad}, ${pais} | ${temperatura}°
                </span>
            </div>
        </div>
    </div>
    `;

    $("#posts").append(carta);
}

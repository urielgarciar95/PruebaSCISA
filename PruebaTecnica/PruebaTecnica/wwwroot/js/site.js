
var urlEspecies = "https://pokeapi.co/api/v2/pokemon-species/?offset=0&limit=1025";
let paginaActual = 1;
const filasPorPagina = 5;
$(document).ready(function () {
    $("#Excel").hide();
    $("#Correo").hide();
    llenarComboEspecies()
});

//Función para exportar a Excel 
$("#Excel").click(function () {

    const tabla = document.getElementById("tabla");

    const workbook = XLSX.utils.table_to_book(tabla);

    XLSX.writeFile(workbook, "Pokemones.xlsx");

});

//Funcion para enviar correo
$("#Correo").click(function () {
    //alert("enviar correo");
    let pokemones = [];

    $("#tabla tbody tr").each(function () {

        let columnas = $(this).find("td");

        pokemones.push({
            nombre: $(columnas[0]).text(),
            imagen: $(columnas[1]).find("img").attr("src")
        });
    });

    console.log("pokemones", pokemones);

   $.ajax({
        url: "/Home/EnviarCorreo",
        type: "POST",
        dataType: 'json',
        contentType: "application/json",
        data: JSON.stringify({
            pokemones: pokemones
        }),

       success: function (response) {
           //Validar codigo de error
           if(response.res == 0)
               alert("Correo enviado correctamente");
           else
               alert("Error al enviar correo");
        },

        error: function () {
            alert("Error al enviar el correo");
        }
    });
});


$(document).ajaxStart(function () {

    $("#loader")
        .removeClass("d-none")
        .addClass("d-flex");

});

$(document).ajaxStop(function () {

    $("#loader")
        .removeClass("d-flex")
        .addClass("d-none");

});

function llenarComboEspecies() {
    $.ajax({
        url: urlEspecies,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            /*console.log('Datos recibidos:', response.results.length);*/
            let comboEspecies = '<option value="">Seleccionar especie...</option>';
            /*Recorrer arreglo de especies y llenar combo*/
            for (var x = 0; x < response.results.length; x++) {
                var item = response.results[x];
                //console.log("nombre: ", item.url);
                comboEspecies += `<option value="${item.url}">${item.name}</option>`;
            }

            $("#especies").html(comboEspecies);
        },
        error: function (xhr, status, error) {
            console.error('Ocurrió un error:', error);
        }
    });
}

function BuscarPokemon() {
    /*alert("Buscar pokemon");*/
    //ocultar botones hasta que responda
    $("#Excel").hide();
    $("#Correo").hide();
    var tabla = $("#tablaPokemon");
    var especie = $("#especies").val();
    var buscarEspecie = 0;

    //Limpiar tabla por si se está mostrando información y se consulta un nuevo pokemon
    tabla.html("");
    try {
        if (especie != "") {
            //alert("Hay una especie seleccionad");
            buscarEspecie = 1;
        }

        //alert("Buscar especie " + buscarEspecie);
        var nombrePokemon = $("#nombre").val();
        //alert("nombre "+ nombrePokemon);
        $.ajax({
            url: 'Home/BuscarPokemon',
            type: 'POST',
            dataType: 'json',
            data: { nombre: nombrePokemon, buscarEspecie: buscarEspecie, urlEspecie: especie },
            success: function (response) {
                console.log(response);
                $("#Excel").show();
                $("#Correo").show();
                for (var i = 0; i < response.length; i++) {

                    tabla.append(`
                        <tr>
                            <td>${response[i].nombre}</td>
                            <td>
                                <img src="${response[i].imagen}" width="80">
                            </td>
                        </tr>
                    `);
                }
                mostrarPagina(1);

            },
            error: function (xhr, status, error) {
                console.error('Ocurrió un error:', error);
                $("#Excel").hide();
                $("#Correo").hide();
                alert("Pokemon no encontrado");
            }
        });
    } catch (error) {
        alert("Error:", error.message);
    }

}

function mostrarPagina(pagina) {

    const tabla = document.getElementById("tablaPokemon");
    const filas = tabla.querySelectorAll("tbody tr");

    const totalPaginas = Math.ceil(filas.length / filasPorPagina);

    // Validar límites
    if (pagina < 1) pagina = 1;
    if (pagina > totalPaginas) pagina = totalPaginas;

    paginaActual = pagina;

    // Ocultar todas las filas
    filas.forEach((fila, index) => {

        const inicio = (paginaActual - 1) * filasPorPagina;
        const fin = inicio + filasPorPagina;

        if (index >= inicio && index < fin) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });

    crearBotones(totalPaginas);
}


//Agregar paginación a tabla de resultados
function crearBotones(totalPaginas) {

    const paginacion = document.getElementById("paginacion");

    paginacion.innerHTML = "";

    // Botón anterior
    const btnAnterior = document.createElement("button");

    btnAnterior.innerText = "Anterior";

    btnAnterior.onclick = function () {
        mostrarPagina(paginaActual - 1);
    };

    btnAnterior.disabled = paginaActual === 1;

    paginacion.appendChild(btnAnterior);


    // Botones numéricos
    for (let i = 1; i <= totalPaginas; i++) {

        const boton = document.createElement("button");

        boton.innerText = i;

        if (i === paginaActual) {
            boton.style.fontWeight = "bold";
        }

        boton.onclick = function () {
            mostrarPagina(i);
        };

        paginacion.appendChild(boton);
    }


    // Botón siguiente
    const btnSiguiente = document.createElement("button");

    btnSiguiente.innerText = "Siguiente";

    btnSiguiente.onclick = function () {
        mostrarPagina(paginaActual + 1);
    };

    btnSiguiente.disabled = paginaActual === totalPaginas;

    paginacion.appendChild(btnSiguiente);
}



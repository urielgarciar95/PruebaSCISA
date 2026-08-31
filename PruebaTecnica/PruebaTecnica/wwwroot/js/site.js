
var urlEspecies = "https://pokeapi.co/api/v2/pokemon-species/?offset=0&limit=1025";

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

var urlEspecies = "https://pokeapi.co/api/v2/pokemon-species/?offset=0&limit=1025";

$(document).ready(function () {
    $("#Excel").hide();
    $("#Correo").hide();
    llenarComboEspecies()
});


$("#Excel").click(function () {

    const tabla = document.getElementById("tabla");

    const workbook = XLSX.utils.table_to_book(tabla);

    XLSX.writeFile(workbook, "Pokemones.xlsx");

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
    var tabla = $("#tablaPokemon");

    //Limpiar tabla por si se está mostrando información y se consulta un nuevo pokemon
    tabla.html("");
    try {
        var nombrePokemon = $("#nombre").val();
        //alert("nombre "+ nombrePokemon);
        $.ajax({
            url: 'Home/BuscarPokemon',
            type: 'POST',
            dataType: 'json',
            data: { nombre: nombrePokemon },
            success: function (response) {
                console.log(response);
                $("#Excel").show();
                $("#Correo").show();
                tabla.append(`
                    <tr>
                        <td>${response.nombre}</td>
                        <td>
                            <img src="${response.imagen}" width="80">
                        </td>
                    </tr>
                `);

            },
            error: function (xhr, status, error) {
                console.error('Ocurrió un error:', error);
            }
        });
    } catch (error) {
        alert("Error:", error.message);
    }

}
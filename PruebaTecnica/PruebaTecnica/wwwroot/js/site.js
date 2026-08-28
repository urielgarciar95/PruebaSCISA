
var urlEspecies = "https://pokeapi.co/api/v2/pokemon-species/?offset=0&limit=1025";

$(document).ready(function () {
    llenarComboEspecies()
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
                console.log("nombre: ", item.name);
                comboEspecies += `<option value="${item.url}">${item.name}</option>`;
            }

            $("#especies").html(comboEspecies);
        },
        error: function (xhr, status, error) {
            console.error('Ocurrió un error:', error);
        }
    });
}
using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Models;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using MailKit.Net.Smtp;
using MimeKit;
using System;


namespace PruebaTecnica.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;


        public HomeController(ILogger<HomeController> logger, IHttpClientFactory httpClientFactory, IConfiguration configuration)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [HttpPost]
        public async Task<IActionResult> BuscarPokemon(string nombre, int buscarEspecie, string urlEspecie)
        {
            var client = _httpClientFactory.CreateClient();
            var resultado = new List<object>();

            //Si selecciona una especie se dara prioridad aunque se haya tecleado un pokemon 
            if (buscarEspecie > 0)
            {            

                var response = await client.GetAsync(
                    urlEspecie
                );

                if (!response.IsSuccessStatusCode)
                {
                    return NotFound(new
                    {
                        mensaje = "Pokémon no encontrado"
                    });
                }
                var json = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                };

                //var pokemon = JsonSerializer.Deserialize<JsonElement>(json);

                var especie = JsonSerializer.Deserialize<PokemonSpecies>(
                    json,
                    options
                );



                foreach (var variedad in especie.Varieties)
                {
                    Console.WriteLine($"Consultar datos {variedad.Pokemon.Url}");
                    var res = await ObtenerDatos(variedad.Pokemon.Url);
                    /*var pokemonResponse = await client.GetAsync(
                        variedad.Pokemon.Url
                    );

                    var pokemonJson = await pokemonResponse.Content.ReadAsStringAsync();

                    var pokemon = JsonSerializer.Deserialize<PokemonDetail>(
                        pokemonJson,
                        options
                    );*/

                    resultado.Add(res);
                }
            }
            else
            {
                resultado.Add(await ObtenerDatos($"https://pokeapi.co/api/v2/pokemon/{nombre.ToLower()}"));
            }

            Console.WriteLine($"Arreglo {resultado}");

            return Json(resultado);

        }

        public async Task<PokemonModel> ObtenerDatos(string url)
        {
            var client = _httpClientFactory.CreateClient();
            var response = await client.GetAsync(
                url
            );

            /*if (!response.IsSuccessStatusCode)
            {
                return NotFound(new
                {
                    mensaje = "Pokémon no encontrado"
                });
            }*/

            var json = await response.Content.ReadAsStringAsync();

            var pokemon = JsonSerializer.Deserialize<JsonElement>(json);

            //Validar respuesta con el Modelo
            var resultado = new PokemonModel
            {
                Nombre = pokemon.GetProperty("name").GetString(),
                Imagen = pokemon
                    .GetProperty("sprites")
                    .GetProperty("front_default")
                    .GetString()
            };

            return resultado;
        }

        //Funcion para enviar correo
        [HttpPost]
        public async Task<IActionResult> EnviarCorreo([FromBody] EnviarCorreoRequest request)
        {
            StringBuilder html = new StringBuilder();

            html.Append("<h1>Lista de Pokémon</h1>");

            html.Append("<table border='1'>");

            html.Append(@"
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Imagen</th>
                        </tr>
            ");

            foreach (var pokemon in request.Pokemones)
            {
                html.Append($@"
                    <tr>
                        <td>{pokemon.Nombre}</td>
                        <td>
                            <img src='{pokemon.Imagen}' width='80'>
                        </td>
                    </tr>
                ");
            }

            html.Append("</table>");


          var response =  await EnviarEmail(
                html.ToString()
            );

            var resultado = new
            {
                res = response
            };

            return Json(resultado);

        }

        public async Task<int> EnviarEmail(string contenidoHtml)
        {
            int res = 0;
            try
            {
                var mensaje = new MimeMessage();

                mensaje.From.Add(
                    new MailboxAddress(
                        "Mi Aplicación",
                        _configuration["DatosCorreo:Usuario"]
                    )
                );

                mensaje.To.Add(
                    new MailboxAddress(
                        "",
                        _configuration["DatosCorreo:Destinatario"]
                    )
                );

                mensaje.Subject = "Lista de Pokémon";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = contenidoHtml
                };

                mensaje.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();

                await client.ConnectAsync(
                    "smtp.gmail.com",
                    587,
                    false
                );
                Console.WriteLine($"usuario {_configuration["DatosCorreo:Usuario"]}");

                await client.AuthenticateAsync(
                    _configuration["DatosCorreo:Usuario"],
                    _configuration["DatosCorreo:Password"]
                );

                await client.SendAsync(mensaje);

                await client.DisconnectAsync(true);
            }
            catch(Exception ex) 
            {
                Console.WriteLine($"Error al enviar correo {ex}");
                res = 1;
            }

            return res;

        }
    }
}

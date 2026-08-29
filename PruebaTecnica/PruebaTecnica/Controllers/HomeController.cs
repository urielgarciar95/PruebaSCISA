using Microsoft.AspNetCore.Mvc;
using PruebaTecnica.Models;
using System.Diagnostics;
using System.Net.Http;
using System.Text.Json;

namespace PruebaTecnica.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IHttpClientFactory _httpClientFactory;

        public HomeController(ILogger<HomeController> logger, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
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
        public async Task<IActionResult> BuscarPokemon(string nombre)
        {
            var client = _httpClientFactory.CreateClient();

            var response = await client.GetAsync(
                $"https://pokeapi.co/api/v2/pokemon/{nombre.ToLower()}"
            );

            if (!response.IsSuccessStatusCode)
            {
                return NotFound(new
                {
                    mensaje = "Pokémon no encontrado"
                });
            }

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

            return Json(resultado);

        }
    }
}

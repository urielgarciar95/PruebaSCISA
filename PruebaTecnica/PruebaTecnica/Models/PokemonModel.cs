using System.Text.Json.Serialization;

namespace PruebaTecnica.Models
{
    public class PokemonModel
    {
        public string Nombre { get; set; } = string.Empty;
        public string Imagen { get; set; } = string.Empty;
    }

    public class EnviarCorreoRequest
    {
        public List<PokemonModel> Pokemones { get; set; }
    }

    public class PokemonSpecies
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("varieties")]
        public List<PokemonVariety> Varieties { get; set; }
    }

    public class PokemonVariety
    {
        [JsonPropertyName("is_default")]
        public bool IsDefault { get; set; }

        [JsonPropertyName("pokemon")]
        public PokemonReference Pokemon { get; set; }
    }

    public class PokemonReference
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("url")]
        public string Url { get; set; }
    }
}

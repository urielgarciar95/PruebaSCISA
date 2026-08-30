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
}

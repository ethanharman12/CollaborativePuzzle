using GiphyDotNet.Manager;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace CollaborativePuzzle.Controllers
{
    [Route("api/Giphy")]
    [ApiController]
    public class GiphyController : ControllerBase
    {
        public IConfiguration Configuration { get; }

        public GiphyController(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        [HttpGet]
        [Route("GetRandomGif")]
        public async Task<string> GetRandomGif(string searchParameter)
        {
            var giphy = new Giphy(Configuration["RemotePuzzle:GiphyApiKey"]);
            
            var randomGif = await giphy.RandomGif(new GiphyDotNet.Model.Parameters.RandomParameter { Tag = searchParameter });

            return randomGif.Data.ImageMp4Url;
        }

        [HttpGet]
        [Route("GetRandomSticker")]
        public async Task<string> GetRandomSticker(string searchParameter)
        {
            var giphy = new Giphy(Configuration["RemotePuzzle:GiphyApiKey"]);

            var randomGif = await giphy.RandomSticker(new GiphyDotNet.Model.Parameters.RandomParameter { Tag = searchParameter });

            return randomGif.Data.ImageMp4Url;
        }
    }
}
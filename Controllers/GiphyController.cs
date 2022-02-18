using ByteDev.Giphy;
using ByteDev.Giphy.Contract.Request;
using ByteDev.Giphy.Contract.Request.Stickers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
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
            using (var client = new HttpClient())
            {
                var giphy = new GiphyApiClient(client);
                var random = await giphy.GetRandomAsync(new RandomRequest(Configuration["RemotePuzzle:GiphyApiKey"]) { Tag = searchParameter });

                return random.Gif.Images.PreviewMp4.Mp4Url.ToString();
            }
        }

        [HttpGet]
        [Route("GetRandomSticker")]
        public async Task<string> GetRandomSticker(string searchParameter)
        {
            using (var client = new HttpClient())
            {               
                var giphy = new GiphyStickerApiClient(client);
                var random = await giphy.GetRandomStickerAsync(new StickerRandomRequest(Configuration["RemotePuzzle:GiphyApiKey"]) { Tag = searchParameter });

                return random.Gif.Images.PreviewMp4.Mp4Url.ToString();
            }
        }
    }
}
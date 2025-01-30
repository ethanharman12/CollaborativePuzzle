using CollaborativePuzzle.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using System;
using System.Linq;

namespace CollaborativePuzzle.Controllers
{
    public class GameController : Controller
    {
        private IMemoryCache Cache;
        private readonly string[] blackListedNames = { 
            "Index", 
            "Default",
            "New",
            "Create",
            ""
        };

        public IConfiguration Configuration { get; }

        public GameController(IMemoryCache cache, IConfiguration configuration)
        {
            Cache = cache; 
            Configuration = configuration;
        }

        [Route("/Game/{gameId}")]
        public IActionResult Index(string gameId)
        {
            if (!string.IsNullOrEmpty(gameId))
            {
                if (Cache.TryGetValue(gameId, out GameViewModel viewModel))
                {
                    return View("ActiveGame", viewModel);
                }
            }

            return RedirectToAction("New");
        }

        [Route("/Game/New")]
        public IActionResult New()
        {
            return View();
        }

        [HttpPost]
        [RequestSizeLimit(10485760)]
        [Route("/Game/Create")]
        public IActionResult Create(GameViewModel game)
        {
            if(!string.IsNullOrEmpty(game.GiphyUrl))
            {
                game.IsVideo = true;
                game.VideoSrc = game.GiphyUrl;
            }
            else if (game.ImageFile != null)
            {
                game.ImageString = game.GetFileString();
                game.IsVideo = game.GetIsVideo(game.ImageFile.FileName);
                game.VideoSrc = String.Format("data:video/mp4;base64,{0}", game.ImageString);
                game.ImageSrc = String.Format("data:image/png;base64,{0}", game.ImageString);
            }
            else
            {
                game.IsVideo = game.GetIsVideo(game.LinkUrl);
                game.VideoSrc = game.LinkUrl;
                game.ImageSrc = game.LinkUrl;
            }
            
            game.GameId = game.Title.Replace(" ", string.Empty);

            while (Cache.TryGetValue(game.GameId, out var value) || blackListedNames.Contains(game.GameId))
            {
                game.GameId += "1";
            }

            Cache.Set(game.GameId, game);

            return RedirectToAction("Index", new { game.GameId });
        }
    }
}
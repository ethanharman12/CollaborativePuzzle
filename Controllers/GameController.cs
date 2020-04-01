using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CollaborativePuzzle.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;

namespace CollaborativePuzzle.Controllers
{
    public class GameController : Controller
    {
        private IMemoryCache Cache;

        public GameController(IMemoryCache cache)
        {
            Cache = cache;
        }

        [Route("/Game/{gameId}")]
        public IActionResult Index(string gameId)
        {
            GameViewModel viewModel = GetDefaultGame();

            if (!string.IsNullOrEmpty(gameId))
            {
                if (!Cache.TryGetValue(gameId, out viewModel))
                {
                    viewModel = GetDefaultGame();
                }
            }

            return View("ActiveGame", viewModel);
        }

        public IActionResult Default()
        {
            return View("ActiveGame", GetDefaultGame());
        }

        public IActionResult New()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create(GameViewModel game)
        {
            game.GameId = game.Title.Replace(" ", string.Empty);
            Cache.Set(game.GameId, game);

            return RedirectToAction("Index", new { game.GameId });
        }

        private GameViewModel GetDefaultGame()
        {
            return new GameViewModel
            {
                Title = "Puzzle",
                GameId = "1234",
                ImagePath = "~/Images/Emo Panflute Album Cover.jpg"
            };
        }
    }
}
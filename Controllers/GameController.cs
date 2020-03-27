using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace CollaborativePuzzle.Controllers
{
    public class GameController : Controller
    {
        public IActionResult Index(string gameId)
        {
            return View("ActiveGame");
        }

        public IActionResult New()
        {
            return View();
        }

        [HttpPost]
        public IActionResult Create()
        {
            return RedirectToAction("Index", new { gameId = "1234" });
        }
    }
}
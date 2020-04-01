using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CollaborativePuzzle.Models
{
    public class GameViewModel
    {
        public string GameId { get; set; }
        public string ImagePath { get; set; }
        public string Title { get; set; }
        public List<Player> Players { get; set; }
        public List<PuzzlePiece> Pieces { get; set; }

        public GameViewModel()
        {
            Players = new List<Player>();
        }
    }
}

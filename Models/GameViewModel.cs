using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace CollaborativePuzzle.Models
{
    public class GameViewModel
    {
        public string GameId { get; set; }
        public string ImagePath { get; set; }
        public string Title { get; set; }
        public IFormFile ImageFile { get; set; }
        public string ImageString { get; set; }
        public List<Player> Players { get; set; }
        public List<PuzzlePiece> Pieces { get; set; }
        public int NumberOfRows { get; set; }
        public int NumberOfColumns { get; set; }
        public bool DisplayPreview { get; set; }

        public GameViewModel()
        {
            Players = new List<Player>();
        }

        public string GetImageString()
        {
            string imageString;

            using (MemoryStream ms = new MemoryStream())
            {
                ImageFile.CopyTo(ms);
                byte[] array = ms.GetBuffer();
                imageString = Convert.ToBase64String(array);
            }

            return imageString;
        }
    }
}

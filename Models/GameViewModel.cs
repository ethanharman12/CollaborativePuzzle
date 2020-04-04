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
        public bool IsVideo { get; set; }

        public GameViewModel()
        {
            Players = new List<Player>();
        }

        public string GetFileString()
        {
            string fileString;

            using (MemoryStream ms = new MemoryStream())
            {
                ImageFile.CopyTo(ms);
                byte[] array = ms.GetBuffer();
                fileString = Convert.ToBase64String(array);
            }

            return fileString;
        }

        private readonly string[] videoExtensions = {
            ".GIF", ".MIDI", ".OGG", ".AVI", ".MP4", ".WMV"
        };

        public bool GetIsVideo()
        {
            return videoExtensions.Contains(Path.GetExtension(ImageFile.FileName), StringComparer.OrdinalIgnoreCase);
        }
    }
}

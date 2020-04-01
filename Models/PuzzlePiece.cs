using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CollaborativePuzzle.Models
{
    public class PuzzlePiece
    {
        public int Row { get; set; }
        public int Column { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
    }
}

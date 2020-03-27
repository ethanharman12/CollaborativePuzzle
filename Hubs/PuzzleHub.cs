using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CollaborativePuzzle.Hubs
{
    public class PuzzleHub : Hub
    {
        public async Task MovePiece(int row, int column, double x, double y, string color)
        {
            await Clients.Others.SendAsync("MovePiece", row, column, x, y, color);
        }

        public async Task StopPiece(int row, int column)
        {
            await Clients.Others.SendAsync("StopPiece", row, column);
        }
    }
}

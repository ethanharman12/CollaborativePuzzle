using CollaborativePuzzle.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CollaborativePuzzle.Hubs
{
    public class PuzzleHub : Hub
    {
        private IMemoryCache Cache;

        public PuzzleHub(IMemoryCache cache)
        {
            Cache = cache;
        }

        public async Task JoinGame(string gameId, string name, string color)
        {            
            GameViewModel game;

            if (!Cache.TryGetValue(gameId, out game))
            {
                //game not active?
                return;
            }

            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);

            await Clients.OthersInGroup(gameId).SendAsync("PlayerJoined", name, color);

            var player = new Player
            {
                UserName = name,
                Color = color,
                ConnectionId = Context.ConnectionId
            };            

            foreach (var other in game.Players)
            {
                await Clients.Caller.SendAsync("PlayerJoined", other.UserName, other.Color);
            }

            game.Players.Add(player);

            if (game.Pieces == null)
            {
                await Clients.Caller.SendAsync("PiecesRequest");
            }
            else
            {
                foreach(var piece in game.Pieces)
                {
                    await Clients.Caller.SendAsync("MovePiece", piece.Row, piece.Column, piece.X, piece.Y, color);
                }
                foreach(var piece in game.Pieces)
                {
                    await Clients.Caller.SendAsync("StopPiece", piece.Row, piece.Column);
                }
                //await Clients.Caller.SendAsync("SetupPieces", game.Pieces);
            }
        }

        public async Task StartGame(string gameId, List<PuzzlePiece> pieces) 
        {
            GameViewModel game;

            if (!Cache.TryGetValue(gameId, out game))
            {
                //game not active?
                return;
            }

            game.Pieces = pieces;

            await Clients.Caller.SendAsync("Nothing");
        }

        public async Task MovePiece(
            string gameId,
            int row, 
            int column, 
            double x, 
            double y, 
            string color)
        {
            await Clients.OthersInGroup(gameId).SendAsync("MovePiece", row, column, x, y, color);

            GameViewModel game;

            if (!Cache.TryGetValue(gameId, out game))
            {
                //game not active?
                return;
            }

            var movedPiece = game.Pieces.First(piece => piece.Row == row && piece.Column == column);
            movedPiece.X = x;
            movedPiece.Y = y;
        }

        public async Task StopPiece(
            string gameId,
            int row, 
            int column)
        {
            await Clients.OthersInGroup(gameId).SendAsync("StopPiece", row, column);
        }
    }
}

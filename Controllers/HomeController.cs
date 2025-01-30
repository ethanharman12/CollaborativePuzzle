using CollaborativePuzzle.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Diagnostics;
using System.Net.Mail;

namespace CollaborativePuzzle.Controllers
{
    public class HomeController : Controller
    {
        private readonly IConfiguration Configuration;

        public HomeController(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }
        
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        public IActionResult Feedback()
        {
            return View();
        }

        public IActionResult HowToPlay()
        {
            return View();
        }

        [HttpPost]
        public IActionResult SubmitFeedback(FeedbackViewModel feedback)
        {
            MailMessage mail = new MailMessage();
            SmtpClient SmtpServer = new SmtpClient("smtp.gmail.com");

            mail.From = new MailAddress(feedback.EmailAddress);
            mail.To.Add(Configuration["RemotePuzzle:FeedbackEmailAddress"]);
            mail.Subject = feedback.Subject;
            mail.Body = "From " + feedback.EmailAddress + Environment.NewLine + feedback.Message;

            SmtpServer.Port = 587;
            SmtpServer.Credentials = new System.Net.NetworkCredential(
                Configuration["RemotePuzzle:FeedbackEmailAddress"],
                Configuration["RemotePuzzle:FeedbackPassword"]);
            SmtpServer.EnableSsl = true;

            SmtpServer.Send(mail);

            return View("Feedback");
        }
    }
}

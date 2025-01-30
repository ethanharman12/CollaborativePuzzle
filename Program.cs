using Azure.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using System;

namespace CollaborativePuzzle
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureAppConfiguration((context, config) =>
                {
                    var keyVaultEndpoint = GetKeyVaultEndpoint();
                    if (!string.IsNullOrEmpty(keyVaultEndpoint))
                    {
                        config.AddAzureKeyVault(new Uri(keyVaultEndpoint), new DefaultAzureCredential());
                    }
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });

        private static string GetKeyVaultEndpoint() => "https://productionappsettings.vault.azure.net";

        //public static IHostBuilder CreateHostBuilder(string[] args) =>
        //    Host.CreateDefaultBuilder(args)
        //        .ConfigureAppConfiguration((context, config) =>
        //        {
        //            var keyVaultEndpoint = GetKeyVaultEndpoint();
        //            if (!string.IsNullOrEmpty(keyVaultEndpoint))
        //            {
        //                var azureServiceTokenProvider = new AzureServiceTokenProvider();
        //                var keyVaultClient = new KeyVaultClient(
        //                    new KeyVaultCredential(new KeyVaultClient.AuthenticationCallback(azureServiceTokenProvider.KeyVaultTokenCallback))
        //                    );
        //                config.AddAzureKeyVault(keyVaultEndpoint, keyVaultClient, new DefaultKeyVaultSecretManager());
        //            }
        //        })
        //        .ConfigureWebHostDefaults(webBuilder =>
        //        {
        //            webBuilder.UseStartup<Startup>();
        //        });

        //private static string GetKeyVaultEndpoint() => "https://productionappsettings.vault.azure.net";
    }
}

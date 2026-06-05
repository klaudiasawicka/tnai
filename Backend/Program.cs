using Microsoft.EntityFrameworkCore;
using ProjektTnai.Data;

namespace ProjektTnai
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                    policy.WithOrigins("http://localhost:3000", "http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod());
            });

            builder.Services.AddControllers();
            builder.Services.AddOpenApi();

            var app = builder.Build();

            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                await DbSeeder.InitializeAsync(context);
            }

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseCors("AllowFrontend");
            app.UseHttpsRedirection();
            app.UseAuthorization();
            app.MapControllers();

            app.Run();
        }
    }
}

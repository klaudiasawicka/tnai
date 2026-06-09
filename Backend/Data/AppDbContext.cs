using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProjektTnai.Helpers;
using ProjektTnai.Models;

namespace ProjektTnai.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Resource> Resources { get; set; }
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<ResourceEquipment> ResourceEquipments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Role>(entity =>
            {
                entity.ToTable("Roles"); // Corrected from "Role" to "Roles"
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Id).HasColumnName("id");
                entity.Property(r => r.RoleName)
                    .HasColumnName("nazwa_roli")
                    .HasMaxLength(50)
                    .HasConversion<string>();
            });

            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Użytkownicy");
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Id).HasColumnName("id");
                entity.Property(u => u.Email).HasColumnName("email").HasMaxLength(100);
                entity.Property(u => u.Password).HasColumnName("hasło").HasMaxLength(255);
                entity.Property(u => u.NameSurname).HasColumnName("imię_nazwisko").HasMaxLength(150);
                entity.Property(u => u.Initials).HasColumnName("inicjały").HasMaxLength(20);
                entity.Property(u => u.CreatedAt).HasColumnName("data_rejestracji").HasDefaultValueSql("GETUTCDATE()").ValueGeneratedOnAdd();
                entity.Property(u => u.RoleId).HasColumnName("rola_id");

                entity.HasOne(u => u.Role)
                    .WithMany(r => r.Users)
                    .HasForeignKey(u => u.RoleId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<Equipment>(entity =>
            {
                entity.ToTable("Wyposażenie");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("id");
                entity.Property(e => e.Name).HasColumnName("nazwa").HasMaxLength(200);
            });

            modelBuilder.Entity<Resource>(entity =>
            {
                entity.ToTable("Zasoby");
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Id).HasColumnName("id");
                entity.Property(r => r.Name).HasColumnName("nazwa").HasMaxLength(200);
                entity.Property(r => r.Type)
                    .HasColumnName("typ")
                    .HasMaxLength(50)
                    .HasConversion<string>();
                entity.Property(r => r.Status)
                    .HasColumnName("status")
                    .HasMaxLength(50)
                    .HasConversion<string>();
                entity.Property(r => r.Floor).HasColumnName("piętro");
                entity.Property(r => r.Capacity).HasColumnName("pojemność");
                entity.Property(r => r.PricePerHour).HasColumnName("cena_za_godzinę").HasColumnType("decimal(10,2)");
                entity.Property(r => r.ImageUrl).HasColumnName("url_zdjęcia").HasMaxLength(500);
            });

            modelBuilder.Entity<ResourceEquipment>(entity =>
            {
                entity.ToTable("Zasób_Wyposażenie");
                entity.HasKey(re => new { re.ResourceId, re.EquipmentId });
                entity.Property(re => re.ResourceId).HasColumnName("zasób_id");
                entity.Property(re => re.EquipmentId).HasColumnName("wyposażenie_id");

                entity.HasOne(re => re.Resource)
                    .WithMany(r => r.ResourceEquipments)
                    .HasForeignKey(re => re.ResourceId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(re => re.Equipment)
                    .WithMany(e => e.ResourceEquipments)
                    .HasForeignKey(re => re.EquipmentId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.ToTable("Rezerwacje");
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Id).HasColumnName("id");
                entity.Property(b => b.UserId).HasColumnName("użytkownik_id");
                entity.Property(b => b.ResourceId).HasColumnName("zasób_id");
                entity.Property(b => b.StartTime).HasColumnName("czas_rozpoczęcia");
                entity.Property(b => b.EndTime).HasColumnName("czas_zakończenia");
                entity.Property(b => b.TotalPrice).HasColumnName("łączna_cena").HasColumnType("decimal(10,2)");
                entity.Property(b => b.ParticipantCount).HasColumnName("liczba_uczestników");
                entity.Property(b => b.Note).HasColumnName("notatka");
                entity.Property(b => b.Status)
                    .HasColumnName("status")
                    .HasMaxLength(50)
                    .HasConversion<string>();
                entity.Property(b => b.CreatedAt).HasColumnName("data_utworzenia").HasDefaultValueSql("GETUTCDATE()").ValueGeneratedOnAdd();

                entity.HasOne(b => b.User)
                    .WithMany(u => u.Bookings)
                    .HasForeignKey(b => b.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Resource)
                    .WithMany(r => r.Bookings)
                    .HasForeignKey(b => b.ResourceId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}
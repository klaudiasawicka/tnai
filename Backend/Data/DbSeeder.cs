using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProjektTnai.Helpers;
using ProjektTnai.Models;
using BCrypt.Net;

namespace ProjektTnai.Data
{
    public static class DbSeeder
    {
        public static async Task InitializeAsync(AppDbContext context)
        {
            context.Database.Migrate();

            if (context.Roles.Any())
                return;

            // roles
            var adminRoleId    = Guid.NewGuid();
            var managerRoleId  = Guid.NewGuid();
            var userRoleId     = Guid.NewGuid();

            var roles = new Role[]
            {
                new Role { Id = adminRoleId,   RoleName = RoleName.Admin   },
                new Role { Id = managerRoleId, RoleName = RoleName.Manager },
                new Role { Id = userRoleId,    RoleName = RoleName.User    },
            };

            context.Roles.AddRange(roles);
            await context.SaveChangesAsync();

            // users
            var adminId   = Guid.NewGuid();
            var managerId = Guid.NewGuid();
            var user1Id   = Guid.NewGuid();
            var user2Id   = Guid.NewGuid();

            var users = new User[]
            {
                new User
                {
                    Id          = adminId,
                    Email       = "admin@deskflow.pl",
                    Password    = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                    NameSurname = "Jan Kowalski",
                    Initials    = "JK",
                    RoleId      = adminRoleId,
                    CreatedAt   = DateTime.UtcNow
                },
                new User
                {
                    Id          = managerId,
                    Email       = "manager@deskflow.pl",
                    Password    = BCrypt.Net.BCrypt.HashPassword("Manager123!"),
                    NameSurname = "Anna Nowak",
                    Initials    = "AN",
                    RoleId      = managerRoleId,
                    CreatedAt   = DateTime.UtcNow
                },
                new User
                {
                    Id          = user1Id,
                    Email       = "user1@deskflow.pl",
                    Password    = BCrypt.Net.BCrypt.HashPassword("User123!"),
                    NameSurname = "Piotr Wiśniewski",
                    Initials    = "PW",
                    RoleId      = userRoleId,
                    CreatedAt   = DateTime.UtcNow
                },
                new User
                {
                    Id          = user2Id,
                    Email       = "user2@deskflow.pl",
                    Password    = BCrypt.Net.BCrypt.HashPassword("User123!"),
                    NameSurname = "Marta Zielińska",
                    Initials    = "MZ",
                    RoleId      = userRoleId,
                    CreatedAt   = DateTime.UtcNow
                },
            };

            context.Users.AddRange(users);
            await context.SaveChangesAsync();

            // equipment
            var projectorId    = Guid.NewGuid();
            var whiteboardId   = Guid.NewGuid();
            var videoconfId    = Guid.NewGuid();
            var monitorId      = Guid.NewGuid();
            var dockingStation = Guid.NewGuid();

            var equipments = new Equipment[]
            {
                new Equipment { Id = projectorId,    Name = "Projektor"            },
                new Equipment { Id = whiteboardId,   Name = "Tablica interaktywna" },
                new Equipment { Id = videoconfId,    Name = "System wideokonferencji" },
                new Equipment { Id = monitorId,      Name = "Monitor"              },
                new Equipment { Id = dockingStation, Name = "Stacja dokująca"      },
            };

            context.Equipments.AddRange(equipments);
            await context.SaveChangesAsync();

            // resources
            var desk1Id    = Guid.NewGuid();
            var desk2Id    = Guid.NewGuid();
            var room1Id    = Guid.NewGuid();
            var room2Id    = Guid.NewGuid();
            var office1Id  = Guid.NewGuid();

            var resources = new Resource[]
            {
                new Resource
                {
                    Id           = desk1Id,
                    Name         = "Biurko A1",
                    Type         = ResourceType.Desk,
                    Status       = ResourceStatus.Available,
                    Floor        = 1,
                    Capacity     = 1,
                    PricePerHour = 5.00m,
                    ImageUrl     = null
                },
                new Resource
                {
                    Id           = desk2Id,
                    Name         = "Biurko A2",
                    Type         = ResourceType.Desk,
                    Status       = ResourceStatus.Available,
                    Floor        = 1,
                    Capacity     = 1,
                    PricePerHour = 5.00m,
                    ImageUrl     = null
                },
                new Resource
                {
                    Id           = room1Id,
                    Name         = "Sala Konferencyjna Alpha",
                    Type         = ResourceType.Room,
                    Status       = ResourceStatus.Available,
                    Floor        = 2,
                    Capacity     = 10,
                    PricePerHour = 50.00m,
                    ImageUrl     = null
                },
                new Resource
                {
                    Id           = room2Id,
                    Name         = "Sala Konferencyjna Beta",
                    Type         = ResourceType.Room,
                    Status       = ResourceStatus.Available,
                    Floor        = 2,
                    Capacity     = 20,
                    PricePerHour = 80.00m,
                    ImageUrl     = null
                },
                new Resource
                {
                    Id           = office1Id,
                    Name         = "Biuro Prywatne 301",
                    Type         = ResourceType.Office,
                    Status       = ResourceStatus.Available,
                    Floor        = 3,
                    Capacity     = 4,
                    PricePerHour = 30.00m,
                    ImageUrl     = null
                },
            };

            context.Resources.AddRange(resources);
            await context.SaveChangesAsync();

            // resource <-> equipment links
            var resourceEquipments = new ResourceEquipment[]
            {
                new ResourceEquipment { ResourceId = room1Id,   EquipmentId = projectorId    },
                new ResourceEquipment { ResourceId = room1Id,   EquipmentId = whiteboardId   },
                new ResourceEquipment { ResourceId = room1Id,   EquipmentId = videoconfId    },
                new ResourceEquipment { ResourceId = room2Id,   EquipmentId = projectorId    },
                new ResourceEquipment { ResourceId = room2Id,   EquipmentId = whiteboardId   },
                new ResourceEquipment { ResourceId = room2Id,   EquipmentId = videoconfId    },
                new ResourceEquipment { ResourceId = desk1Id,   EquipmentId = monitorId      },
                new ResourceEquipment { ResourceId = desk1Id,   EquipmentId = dockingStation },
                new ResourceEquipment { ResourceId = desk2Id,   EquipmentId = monitorId      },
                new ResourceEquipment { ResourceId = office1Id, EquipmentId = projectorId    },
                new ResourceEquipment { ResourceId = office1Id, EquipmentId = monitorId      },
            };

            context.ResourceEquipments.AddRange(resourceEquipments);
            await context.SaveChangesAsync();

            // bookings
            var bookings = new Booking[]
            {
                new Booking
                {
                    Id               = Guid.NewGuid(),
                    UserId           = managerId,
                    ResourceId       = room1Id,
                    StartTime        = DateTime.UtcNow.AddDays(1).Date.AddHours(9),
                    EndTime          = DateTime.UtcNow.AddDays(1).Date.AddHours(11),
                    TotalPrice       = 100.00m,
                    ParticipantCount = 8,
                    Note             = "Spotkanie zespołu projektowego",
                    Status           = BookingStatus.Confirmed,
                    CreatedAt        = DateTime.UtcNow
                },
                new Booking
                {
                    Id               = Guid.NewGuid(),
                    UserId           = user1Id,
                    ResourceId       = desk1Id,
                    StartTime        = DateTime.UtcNow.AddDays(2).Date.AddHours(8),
                    EndTime          = DateTime.UtcNow.AddDays(2).Date.AddHours(16),
                    TotalPrice       = 40.00m,
                    ParticipantCount = 1,
                    Note             = null,
                    Status           = BookingStatus.Confirmed,
                    CreatedAt        = DateTime.UtcNow
                },
                new Booking
                {
                    Id               = Guid.NewGuid(),
                    UserId           = user2Id,
                    ResourceId       = room2Id,
                    StartTime        = DateTime.UtcNow.AddDays(3).Date.AddHours(13),
                    EndTime          = DateTime.UtcNow.AddDays(3).Date.AddHours(15),
                    TotalPrice       = 160.00m,
                    ParticipantCount = 15,
                    Note             = "Prezentacja dla klienta",
                    Status           = BookingStatus.Pending,
                    CreatedAt        = DateTime.UtcNow
                },
                new Booking
                {
                    Id               = Guid.NewGuid(),
                    UserId           = adminId,
                    ResourceId       = office1Id,
                    StartTime        = DateTime.UtcNow.AddDays(-7).Date.AddHours(10),
                    EndTime          = DateTime.UtcNow.AddDays(-7).Date.AddHours(12),
                    TotalPrice       = 60.00m,
                    ParticipantCount = 3,
                    Note             = "Rozmowa rekrutacyjna",
                    Status           = BookingStatus.Past,
                    CreatedAt        = DateTime.UtcNow.AddDays(-10)
                },
            };

            context.Bookings.AddRange(bookings);
            await context.SaveChangesAsync();
        }
    }
}
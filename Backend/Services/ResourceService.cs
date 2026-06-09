using Microsoft.EntityFrameworkCore;
using ProjektTnai.Data;
using ProjektTnai.DTOs;
using ProjektTnai.Helpers;
using ProjektTnai.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjektTnai.Services
{
    public class ResourceService : IResourceService
    {
        private readonly AppDbContext _context;

        public ResourceService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ResourceDto>> GetAllResourcesAsync(ResourceType? type = null, ResourceStatus? status = null, int? minCapacity = null, decimal? maxPrice = null)
        {
            var query = _context.Resources
                .Include(r => r.ResourceEquipments)
                .ThenInclude(re => re.Equipment)
                .AsQueryable();

            if (type.HasValue)
            {
                query = query.Where(r => r.Type == type.Value);
            }

            if (status.HasValue)
            {
                query = query.Where(r => r.Status == status.Value);
            }

            if (minCapacity.HasValue)
            {
                query = query.Where(r => r.Capacity >= minCapacity.Value);
            }

            if (maxPrice.HasValue)
            {
                query = query.Where(r => r.PricePerHour <= maxPrice.Value);
            }

            return await query
                .Select(r => new ResourceDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Type = r.Type,
                    Status = r.Status,
                    Floor = r.Floor,
                    Capacity = r.Capacity,
                    PricePerHour = r.PricePerHour,
                    ImageUrl = r.ImageUrl,
                    Equipment = r.ResourceEquipments.Select(re => new EquipmentDto
                    {
                        Id = re.Equipment.Id,
                        Name = re.Equipment.Name
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<ResourceDto?> GetResourceByIdAsync(Guid id)
        {
            var resource = await _context.Resources
                .Include(r => r.ResourceEquipments)
                .ThenInclude(re => re.Equipment)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (resource == null)
            {
                return null;
            }

            return new ResourceDto
            {
                Id = resource.Id,
                Name = resource.Name,
                Type = resource.Type,
                Status = resource.Status,
                Floor = resource.Floor,
                Capacity = resource.Capacity,
                PricePerHour = resource.PricePerHour,
                ImageUrl = resource.ImageUrl,
                Equipment = resource.ResourceEquipments.Select(re => new EquipmentDto
                {
                    Id = re.Equipment.Id,
                    Name = re.Equipment.Name
                }).ToList()
            };
        }

        public async Task<ResourceDto> CreateResourceAsync(CreateResourceDto createResourceDto)
        {
            var resource = new Resource
            {
                Name = createResourceDto.Name,
                Type = createResourceDto.Type,
                Status = createResourceDto.Status,
                Floor = createResourceDto.Floor,
                Capacity = createResourceDto.Capacity,
                PricePerHour = createResourceDto.PricePerHour,
                ImageUrl = createResourceDto.ImageUrl,
            };

            if (createResourceDto.EquipmentIds != null && createResourceDto.EquipmentIds.Any())
            {
                foreach (var equipmentId in createResourceDto.EquipmentIds)
                {
                    resource.ResourceEquipments.Add(new ResourceEquipment
                    {
                        EquipmentId = equipmentId
                    });
                }
            }

            _context.Resources.Add(resource);
            await _context.SaveChangesAsync();

            return await GetResourceByIdAsync(resource.Id) ?? throw new InvalidOperationException("Failed to retrieve created resource.");
        }

        public async Task<ResourceDto?> UpdateResourceAsync(Guid id, UpdateResourceDto updateResourceDto)
        {
            var resource = await _context.Resources
                .Include(r => r.ResourceEquipments)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (resource == null)
            {
                return null;
            }

            resource.Name = updateResourceDto.Name;
            resource.Type = updateResourceDto.Type;
            resource.Status = updateResourceDto.Status;
            resource.Floor = updateResourceDto.Floor;
            resource.Capacity = updateResourceDto.Capacity;
            resource.PricePerHour = updateResourceDto.PricePerHour;
            resource.ImageUrl = updateResourceDto.ImageUrl;

            // Update Equipment
            if (updateResourceDto.EquipmentIds != null)
            {
                // Remove existing equipment
                _context.ResourceEquipments.RemoveRange(resource.ResourceEquipments);

                // Add new equipment
                foreach (var equipmentId in updateResourceDto.EquipmentIds)
                {
                    resource.ResourceEquipments.Add(new ResourceEquipment
                    {
                        EquipmentId = equipmentId
                    });
                }
            }

            await _context.SaveChangesAsync();

            return await GetResourceByIdAsync(resource.Id);
        }

        public async Task<bool> DeleteResourceAsync(Guid id)
        {
            var resource = await _context.Resources.FindAsync(id);
            if (resource == null)
            {
                return false;
            }

            _context.Resources.Remove(resource);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
using ProjektTnai.DTOs;
using ProjektTnai.Helpers;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProjektTnai.Services
{
    public interface IResourceService
    {
        Task<IEnumerable<ResourceDto>> GetAllResourcesAsync(ResourceType? type = null, ResourceStatus? status = null, int? minCapacity = null, decimal? maxPrice = null);
        Task<ResourceDto?> GetResourceByIdAsync(Guid id);
        Task<ResourceDto> CreateResourceAsync(CreateResourceDto createResourceDto);
        Task<ResourceDto?> UpdateResourceAsync(Guid id, UpdateResourceDto updateResourceDto);
        Task<bool> DeleteResourceAsync(Guid id);
    }
}
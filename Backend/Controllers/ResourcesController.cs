using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjektTnai.DTOs;
using ProjektTnai.Helpers;
using ProjektTnai.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProjektTnai.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ResourcesController : ControllerBase
    {
        private readonly IResourceService _resourceService;

        public ResourcesController(IResourceService resourceService)
        {
            _resourceService = resourceService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResourceDto>>> GetAllResources(
            [FromQuery] ResourceType? type,
            [FromQuery] ResourceStatus? status,
            [FromQuery] int? minCapacity,
            [FromQuery] decimal? maxPrice)
        {
            var resources = await _resourceService.GetAllResourcesAsync(type, status, minCapacity, maxPrice);
            return Ok(resources);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ResourceDto>> GetResource(Guid id)
        {
            var resource = await _resourceService.GetResourceByIdAsync(id);
            if (resource == null) return NotFound();
            
            return Ok(resource);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ResourceDto>> CreateResource([FromBody] CreateResourceDto createResourceDto)
        {
            var createdResource = await _resourceService.CreateResourceAsync(createResourceDto);
            return CreatedAtAction(nameof(GetResource), new { id = createdResource.Id }, createdResource);
        }

        [HttpPut("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateResource(Guid id, [FromBody] UpdateResourceDto updateResourceDto)
        {
            var updatedResource = await _resourceService.UpdateResourceAsync(id, updateResourceDto);
            if (updatedResource == null) return NotFound();

            return Ok(updatedResource);
        }

        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteResource(Guid id)
        {
            var success = await _resourceService.DeleteResourceAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}
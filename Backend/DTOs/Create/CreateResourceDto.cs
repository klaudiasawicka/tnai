using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjektTnai.Helpers;

namespace ProjektTnai.DTOs.Create
{
    public class CreateResourceDto
    {
        public string Name { get; set; } = string.Empty;
        public ResourceType Type { get; set; }
        public ResourceStatus Status { get; set; }
        public int Floor { get; set; }
        public int Capacity { get; set; }
        public decimal PricePerHour { get; set; }
        public string? ImageUrl { get; set; }
        public List<Guid> EquipmentIds { get; set; } = [];
    }
}
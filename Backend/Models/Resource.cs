using ProjektTnai.Helpers;

namespace ProjektTnai.Models;

public class Resource
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ResourceType Type { get; set; }
    public ResourceStatus Status { get; set; }
    public int Floor { get; set; }
    public int Capacity { get; set; }
    public decimal PricePerHour { get; set; }
    public string? ImageUrl { get; set; }

    public ICollection<ResourceEquipment> ResourceEquipments { get; set; } = [];
    public ICollection<Booking> Bookings { get; set; } = [];
}

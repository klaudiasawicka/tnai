namespace ProjektTnai.Models;

public class ResourceEquipment
{
    public Guid ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;

    public Guid EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
}

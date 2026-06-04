namespace ProjektTnai.Models;

public class ResourceEquipment
{
    public int ResourceId { get; set; }
    public Resource Resource { get; set; } = null!;

    public int EquipmentId { get; set; }
    public Equipment Equipment { get; set; } = null!;
}

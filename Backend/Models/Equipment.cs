namespace ProjektTnai.Models;

public class Equipment
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<ResourceEquipment> ResourceEquipments { get; set; } = [];
}

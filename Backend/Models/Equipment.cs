namespace ProjektTnai.Models;

public class Equipment
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<ResourceEquipment> ResourceEquipments { get; set; } = [];
}

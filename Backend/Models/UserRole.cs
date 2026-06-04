using ProjektTnai.Helpers;

namespace ProjektTnai.Models;

public class Role
{
    public int Id { get; set; }
    public RoleName RoleName { get; set; }

    public ICollection<User> Users { get; set; } = [];
}

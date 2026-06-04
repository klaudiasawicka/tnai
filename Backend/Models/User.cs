namespace ProjektTnai.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string NameSurname { get; set; } = string.Empty;
    public string Initials { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public int RoleId { get; set; }

    public Role Role { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = [];
}

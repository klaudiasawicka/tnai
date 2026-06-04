using ProjektTnai.Helpers;

namespace ProjektTnai.Models;

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int ResourceId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public decimal TotalPrice { get; set; }
    public int ParticipantCount { get; set; }
    public string? Note { get; set; }
    public BookingStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public User User { get; set; } = null!;
    public Resource Resource { get; set; } = null!;
}

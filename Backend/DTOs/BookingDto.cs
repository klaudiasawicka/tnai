using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjektTnai.Helpers;

namespace ProjektTnai.DTOs
{
    public class BookingDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string UserNameSurname { get; set; } = string.Empty;
        public int ResourceId { get; set; }
        public string ResourceName { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalPrice { get; set; }
        public int ParticipantCount { get; set; }
        public string? Note { get; set; }
        public BookingStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
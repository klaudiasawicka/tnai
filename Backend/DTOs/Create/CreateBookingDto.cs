using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjektTnai.DTOs.Create
{
    public class CreateBookingDto
    {
        public Guid UserId { get; set; }
        public Guid ResourceId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int ParticipantCount { get; set; }
        public string? Note { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjektTnai.Helpers;

namespace ProjektTnai.DTOs
{
    public class UserDto
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int RoleId { get; set; }
        public RoleName RoleName { get; set; }
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjektTnai.DTOs.Create
{
    public class CreateUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string NameSurname { get; set; } = string.Empty;
        public string Initials { get; set; } = string.Empty;
        public int RoleId { get; set; }
    }
}
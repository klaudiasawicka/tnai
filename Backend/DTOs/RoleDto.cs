using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ProjektTnai.Helpers;

namespace ProjektTnai.DTOs
{
    public class RoleDto
    {
        public Guid Id { get; set; }
        public RoleName RoleName { get; set; }
    }
}
using ProjektTnai.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProjektTnai.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        Task<UserDto?> GetUserByIdAsync(Guid id);
    }
}
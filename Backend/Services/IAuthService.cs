using ProjektTnai.DTOs;
using System.Threading.Tasks;

namespace ProjektTnai.Services
{
    public interface IAuthService
    {
        Task<UserDto> RegisterAsync(RegisterDto registerDto);
        Task<TokenDto> LoginAsync(LoginDto loginDto);
        Task<TokenDto> RefreshTokenAsync(TokenDto tokenDto);
    }
}
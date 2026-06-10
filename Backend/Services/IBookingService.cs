using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ProjektTnai.DTOs;
using ProjektTnai.Helpers;

namespace ProjektTnai.Services
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingDto>> GetAllBookingsAsync();
        Task<BookingDto?> GetBookingByIdAsync(Guid id);
        Task<IEnumerable<BookingDto>> GetBookingsByUserIdAsync(Guid userId);
        Task<IEnumerable<BookingDto>> GetBookingsByResourceIdAsync(Guid resourceId);
        Task<BookingDto> CreateBookingAsync(BookingDto bookingDto);
        Task<bool> UpdateBookingStatusAsync(Guid id, BookingStatus status);
        Task<bool> DeleteBookingAsync(Guid id);
        Task<bool> CancelBookingAsync(Guid id, Guid userId);
        Task<bool> ConfirmBookingAsync(Guid id, Guid userId);
    }
}
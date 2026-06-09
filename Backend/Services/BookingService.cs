using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ProjektTnai.DTOs;
using ProjektTnai.Helpers;
using ProjektTnai.Data;
using ProjektTnai.Models;

namespace ProjektTnai.Services
{
    public class BookingService : IBookingService
    {
        private readonly AppDbContext _context;
        
        public BookingService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<BookingDto> CreateBookingAsync(BookingDto bookingDto)
        {
            if (bookingDto.StartTime >= bookingDto.EndTime)
            {
                throw new ArgumentException("Start time must be before end time.");
            }

            bool isOverlapping = await _context.Bookings.AnyAsync(b => 
                b.ResourceId == bookingDto.ResourceId && 
                b.Status != BookingStatus.Cancelled &&
                bookingDto.StartTime < b.EndTime && 
                bookingDto.EndTime > b.StartTime);
            
            if (isOverlapping) throw new InvalidOperationException("Resource is already booked for this time.");

            var booking = new Booking
            {
                UserId = bookingDto.UserId,
                ResourceId = bookingDto.ResourceId,
                StartTime = bookingDto.StartTime,
                EndTime = bookingDto.EndTime,
                TotalPrice = bookingDto.TotalPrice,
                ParticipantCount = bookingDto.ParticipantCount,
                Note = bookingDto.Note,
                Status = bookingDto.Status,
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            bookingDto.Id = booking.Id;

            return bookingDto;
        }

        public async Task<bool> DeleteBookingAsync(Guid id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return false;
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<BookingDto>> GetAllBookingsAsync()
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Resource)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    UserNameSurname = b.User.NameSurname,
                    ResourceId = b.ResourceId,
                    ResourceName = b.Resource.Name,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    TotalPrice = b.TotalPrice,
                    ParticipantCount = b.ParticipantCount,
                    Note = b.Note,
                    Status = b.Status,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<BookingDto?> GetBookingByIdAsync(Guid id)
        {
            var booking = await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Resource)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return null;
            }

            return new BookingDto
            {
                Id = booking.Id,
                UserId = booking.UserId,
                UserNameSurname = booking.User.NameSurname,
                ResourceId = booking.ResourceId,
                ResourceName = booking.Resource.Name,
                StartTime = booking.StartTime,
                EndTime = booking.EndTime,
                TotalPrice = booking.TotalPrice,
                ParticipantCount = booking.ParticipantCount,
                Note = booking.Note,
                Status = booking.Status,
                CreatedAt = booking.CreatedAt
            };
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByResourceIdAsync(Guid resourceId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Resource)
                .Where(b => b.ResourceId == resourceId)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    UserNameSurname = b.User.NameSurname,
                    ResourceId = b.ResourceId,
                    ResourceName = b.Resource.Name,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    TotalPrice = b.TotalPrice,
                    ParticipantCount = b.ParticipantCount,
                    Note = b.Note,
                    Status = b.Status,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<BookingDto>> GetBookingsByUserIdAsync(Guid userId)
        {
            return await _context.Bookings
                .Include(b => b.User)
                .Include(b => b.Resource)
                .Where(b => b.UserId == userId)
                .Select(b => new BookingDto
                {
                    Id = b.Id,
                    UserId = b.UserId,
                    UserNameSurname = b.User.NameSurname,
                    ResourceId = b.ResourceId,
                    ResourceName = b.Resource.Name,
                    StartTime = b.StartTime,
                    EndTime = b.EndTime,
                    TotalPrice = b.TotalPrice,
                    ParticipantCount = b.ParticipantCount,
                    Note = b.Note,
                    Status = b.Status,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> UpdateBookingStatusAsync(Guid id, BookingStatus status)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return false;
            }

            booking.Status = status;
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
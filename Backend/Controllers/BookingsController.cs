using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ProjektTnai.DTOs;
using ProjektTnai.Helpers;
using ProjektTnai.Services;

namespace ProjektTnai.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingsController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetAllBookings()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetMyBookings()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var bookings = await _bookingService.GetBookingsByUserIdAsync(userId);
            return Ok(bookings);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<BookingDto>> GetBooking(Guid id)
        {
            var booking = await _bookingService.GetBookingByIdAsync(id);
            if (booking == null) return NotFound();
            
            return Ok(booking);
        }

        [HttpPost]
        public async Task<ActionResult<BookingDto>> CreateBooking([FromBody] BookingDto bookingDto)
        {
            try
            {
                var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                {
                    return Unauthorized("User ID not found in token.");
                }
                
                // Ensure the booking is created for the authenticated user, unless it's an admin creating it for someone else
                if (!User.IsInRole("Admin") && !User.IsInRole("Manager"))
                {
                    bookingDto.UserId = userId;
                }

                var createdBooking = await _bookingService.CreateBookingAsync(bookingDto);
                return CreatedAtAction(nameof(GetBooking), new { id = createdBooking.Id }, createdBooking);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
        }

        [HttpPatch("{id:guid}/status")]
        [Authorize(Roles = "Admin,Manager")]
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] BookingStatus status)
        {
            var success = await _bookingService.UpdateBookingStatusAsync(id, status);
            if (!success) return NotFound();

            return NoContent();
        }

        [HttpPatch("{id:guid}/confirm")]
        public async Task<IActionResult> ConfirmBooking(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
                return Unauthorized();

            var success = await _bookingService.ConfirmBookingAsync(id, userId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id:guid}/cancel")]
        public async Task<IActionResult> CancelBooking(Guid id)
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var userId))
            {
                return Unauthorized();
            }

            var success = await _bookingService.CancelBookingAsync(id, userId);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteBooking(Guid id)
        {
            var success = await _bookingService.DeleteBookingAsync(id);
            if (!success) return NotFound();

            return NoContent();
        }
    }
}
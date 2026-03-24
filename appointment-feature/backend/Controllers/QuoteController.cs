using AppointmentService.Models;
using AppointmentService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AppointmentService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize]
    public class QuoteController : ControllerBase
    {
        private readonly IQuoteService _svc;
        public QuoteController(IQuoteService svc) => _svc = svc;

        /// <summary>Retrieve the quote raised after a consultation.</summary>
        [HttpGet("ByAppointment")]
        public async Task<IActionResult> GetByAppointment([FromQuery] int appointmentId)
        {
            var quote = await _svc.GetByAppointmentIdAsync(appointmentId);
            if (quote == null)
                return NotFound(new { status = 404, message = "No quote found for this appointment." });

            return Ok(new
            {
                status = 200,
                data   = new
                {
                    quote.QuoteId,
                    quote.AppointmentId,
                    quote.UserId,
                    items = quote.Items.Select(i => new
                    {
                        i.ProductId,
                        i.ProductName,
                        i.Qty,
                        unitPrice  = i.UnitPrice,
                        totalPrice = i.TotalPrice,
                    }),
                    quote.TotalAmount,
                    validUntil  = quote.ValidUntil.ToString("yyyy-MM-dd"),
                    checkoutUrl = $"/checkout?quoteId={quote.QuoteId}",
                }
            });
        }

        /// <summary>Create a new quote linked to an appointment (specialist / admin only).</summary>
        [HttpPost]
        [Authorize(Roles = "admin,specialist")]
        public async Task<IActionResult> Create([FromBody] CreateQuoteRequest request)
        {
            var quote = await _svc.CreateAsync(request);
            if (quote == null)
                return BadRequest(new { status = 400, message = "Failed to create quote." });

            return Ok(new { status = 200, data = new { quote.QuoteId, quote.AppointmentId } });
        }
    }
}

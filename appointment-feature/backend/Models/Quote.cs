namespace AppointmentService.Models
{
    public class Quote
    {
        public int QuoteId { get; set; }
        public int AppointmentId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public List<QuoteItem> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
        public DateTime ValidUntil { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Appointment? Appointment { get; set; }
    }

    public class QuoteItem
    {
        public int QuoteItemId { get; set; }
        public int QuoteId { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice => Qty * UnitPrice;
    }

    /// <summary>Request body for POST /Quote.</summary>
    public class CreateQuoteRequest
    {
        public int AppointmentId { get; set; }
        public string UserId { get; set; } = string.Empty;
        public List<QuoteItemRequest> Items { get; set; } = new();
    }

    public class QuoteItemRequest
    {
        public int? ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Qty { get; set; }
        public decimal UnitPrice { get; set; }
    }
}

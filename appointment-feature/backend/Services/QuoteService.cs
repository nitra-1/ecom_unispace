using AppointmentService.Models;
using Microsoft.Data.SqlClient;

namespace AppointmentService.Services
{
    public interface IQuoteService
    {
        Task<Quote?> CreateAsync(CreateQuoteRequest request);
        Task<Quote?> GetByAppointmentIdAsync(int appointmentId);
    }

    public class QuoteService : IQuoteService
    {
        private readonly string _connStr;

        public QuoteService(IConfiguration config)
        {
            _connStr = config.GetConnectionString("AppointmentDb")!;
        }

        public async Task<Quote?> CreateAsync(CreateQuoteRequest request)
        {
            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var tx = conn.BeginTransaction();

            try
            {
                var totalAmount = request.Items.Sum(i => i.Qty * i.UnitPrice);
                var validUntil  = DateTime.UtcNow.AddDays(7);

                const string quoteSql = @"
                    INSERT INTO Quotes (AppointmentId, UserId, TotalAmount, ValidUntil, CreatedAt)
                    OUTPUT INSERTED.QuoteId
                    VALUES (@appointmentId, @userId, @total, @validUntil, GETUTCDATE())";

                await using var quoteCmd = new SqlCommand(quoteSql, conn, tx);
                quoteCmd.Parameters.AddWithValue("@appointmentId", request.AppointmentId);
                quoteCmd.Parameters.AddWithValue("@userId",        request.UserId);
                quoteCmd.Parameters.AddWithValue("@total",         totalAmount);
                quoteCmd.Parameters.AddWithValue("@validUntil",    validUntil);

                var quoteId = (int)(await quoteCmd.ExecuteScalarAsync())!;

                foreach (var item in request.Items)
                {
                    const string itemSql = @"
                        INSERT INTO QuoteItems (QuoteId, ProductId, ProductName, Qty, UnitPrice)
                        VALUES (@quoteId, @productId, @name, @qty, @price)";

                    await using var itemCmd = new SqlCommand(itemSql, conn, tx);
                    itemCmd.Parameters.AddWithValue("@quoteId",    quoteId);
                    itemCmd.Parameters.AddWithValue("@productId",  item.ProductId ?? (object)DBNull.Value);
                    itemCmd.Parameters.AddWithValue("@name",       item.ProductName);
                    itemCmd.Parameters.AddWithValue("@qty",        item.Qty);
                    itemCmd.Parameters.AddWithValue("@price",      item.UnitPrice);
                    await itemCmd.ExecuteNonQueryAsync();
                }

                // Link quote back to the appointment
                const string linkSql = "UPDATE Appointments SET QuoteId = @quoteId WHERE AppointmentId = @apptId";
                await using var linkCmd = new SqlCommand(linkSql, conn, tx);
                linkCmd.Parameters.AddWithValue("@quoteId", quoteId);
                linkCmd.Parameters.AddWithValue("@apptId",  request.AppointmentId);
                await linkCmd.ExecuteNonQueryAsync();

                await tx.CommitAsync();

                return new Quote
                {
                    QuoteId         = quoteId,
                    AppointmentId   = request.AppointmentId,
                    UserId          = request.UserId,
                    TotalAmount     = totalAmount,
                    ValidUntil      = validUntil,
                    Items = request.Items.Select(i => new QuoteItem
                    {
                        ProductId   = i.ProductId,
                        ProductName = i.ProductName,
                        Qty         = i.Qty,
                        UnitPrice   = i.UnitPrice,
                    }).ToList(),
                };
            }
            catch
            {
                await tx.RollbackAsync();
                throw;
            }
        }

        public async Task<Quote?> GetByAppointmentIdAsync(int appointmentId)
        {
            const string sql = @"
                SELECT q.QuoteId, q.AppointmentId, q.UserId, q.TotalAmount, q.ValidUntil,
                       qi.QuoteItemId, qi.ProductId, qi.ProductName, qi.Qty, qi.UnitPrice
                FROM Quotes q
                LEFT JOIN QuoteItems qi ON qi.QuoteId = q.QuoteId
                WHERE q.AppointmentId = @appointmentId
                ORDER BY qi.QuoteItemId";

            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@appointmentId", appointmentId);

            Quote? quote = null;
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                quote ??= new Quote
                {
                    QuoteId       = reader.GetInt32(0),
                    AppointmentId = reader.GetInt32(1),
                    UserId        = reader.GetString(2),
                    TotalAmount   = reader.GetDecimal(3),
                    ValidUntil    = reader.GetDateTime(4),
                };

                if (!reader.IsDBNull(5))
                {
                    quote.Items.Add(new QuoteItem
                    {
                        QuoteItemId = reader.GetInt32(5),
                        ProductId   = reader.IsDBNull(6) ? null : reader.GetInt32(6),
                        ProductName = reader.GetString(7),
                        Qty         = reader.GetInt32(8),
                        UnitPrice   = reader.GetDecimal(9),
                    });
                }
            }
            return quote;
        }
    }
}

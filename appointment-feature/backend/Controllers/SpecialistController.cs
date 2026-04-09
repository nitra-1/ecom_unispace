using AppointmentService.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace AppointmentService.Controllers
{
    [ApiController]
    [Route("[controller]")]
    [Authorize(Roles = "admin")]
    public class SpecialistController : ControllerBase
    {
        private readonly string _connStr;

        public SpecialistController(IConfiguration config)
        {
            _connStr = config.GetConnectionString("AppointmentDb")!;
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAll()
        {
            var list = new List<Specialist>();
            const string sql = "SELECT * FROM Specialists ORDER BY Name";
            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            await using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
                list.Add(MapRow(reader));
            return Ok(new { status = 200, data = list });
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            const string sql = "SELECT * FROM Specialists WHERE SpecialistId = @id";
            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@id", id);
            await using var reader = await cmd.ExecuteReaderAsync();
            if (!await reader.ReadAsync())
                return NotFound(new { status = 404, message = "Specialist not found." });
            return Ok(new { status = 200, data = MapRow(reader) });
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Specialist specialist)
        {
            const string sql = @"
                INSERT INTO Specialists (Name, Email, PhoneNo, Categories, IsActive, CreatedAt, UpdatedAt)
                OUTPUT INSERTED.SpecialistId
                VALUES (@name, @email, @phone, @categories, 1, GETUTCDATE(), GETUTCDATE())";
            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@name",       specialist.Name);
            cmd.Parameters.AddWithValue("@email",      specialist.Email);
            cmd.Parameters.AddWithValue("@phone",      specialist.PhoneNo);
            cmd.Parameters.AddWithValue("@categories", specialist.Categories);
            var id = (int)(await cmd.ExecuteScalarAsync())!;
            specialist.SpecialistId = id;
            return Ok(new { status = 200, data = specialist });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] Specialist specialist)
        {
            const string sql = @"
                UPDATE Specialists
                SET Name = @name, Email = @email, PhoneNo = @phone,
                    Categories = @categories, UpdatedAt = GETUTCDATE()
                WHERE SpecialistId = @id";
            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@name",       specialist.Name);
            cmd.Parameters.AddWithValue("@email",      specialist.Email);
            cmd.Parameters.AddWithValue("@phone",      specialist.PhoneNo);
            cmd.Parameters.AddWithValue("@categories", specialist.Categories);
            cmd.Parameters.AddWithValue("@id",         id);
            await cmd.ExecuteNonQueryAsync();
            return Ok(new { status = 200, message = "Specialist updated." });
        }

        [HttpPut("{id:int}/toggle-active")]
        public async Task<IActionResult> ToggleActive(int id)
        {
            const string sql = @"
                UPDATE Specialists
                SET IsActive = CASE WHEN IsActive = 1 THEN 0 ELSE 1 END, UpdatedAt = GETUTCDATE()
                WHERE SpecialistId = @id";
            await using var conn = new SqlConnection(_connStr);
            await conn.OpenAsync();
            await using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@id", id);
            await cmd.ExecuteNonQueryAsync();
            return Ok(new { status = 200, message = "Specialist status toggled." });
        }

        private static Specialist MapRow(SqlDataReader r) => new()
        {
            SpecialistId = r.GetInt32(0),
            Name         = r.GetString(1),
            Email        = r.GetString(2),
            PhoneNo      = r.GetString(3),
            Categories   = r.GetString(4),
            IsActive     = r.GetBoolean(5),
            CreatedAt    = r.GetDateTime(6),
            UpdatedAt    = r.GetDateTime(7),
        };
    }
}

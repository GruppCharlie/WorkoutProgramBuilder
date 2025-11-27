using NPoco;

namespace WorkoutProgramBuilder.Business.Dto;

[TableName("UserEmails")]
[PrimaryKey("Id", AutoIncrement = true)]
public class UserEmail
{
    [Column("Id")]
    public int Id { get; set; }

    [Column("Email")]
    public string Email { get; set; } = string.Empty;

    [Column("CreatedAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


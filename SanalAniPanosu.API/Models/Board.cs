namespace SanalAniPanosu.API.Models;

public class Board
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsPublic { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CoverImage { get; set; }
    
    // Foreign key
    public string UserId { get; set; } = string.Empty;
    
    // Navigation properties
    public AppUser? User { get; set; }
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
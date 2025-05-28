namespace SanalAniPanosu.API.Models;

public class Post
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ImageUrl { get; set; }
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Foreign keys
    public int BoardId { get; set; }
    public string UserId { get; set; } = string.Empty;
    
    // Navigation properties
    public Board? Board { get; set; }
    public AppUser? User { get; set; }
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
} 
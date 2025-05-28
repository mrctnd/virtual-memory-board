namespace SanalAniPanosu.API.Models;

public class Comment
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Foreign keys
    public int? PostId { get; set; }
    public int? BoardId { get; set; }
    public string UserId { get; set; } = string.Empty;
    
    // Navigation properties
    public Post? Post { get; set; }
    public Board? Board { get; set; }
    public AppUser? User { get; set; }
} 
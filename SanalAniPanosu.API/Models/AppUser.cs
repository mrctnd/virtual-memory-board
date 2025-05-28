using Microsoft.AspNetCore.Identity;

namespace SanalAniPanosu.API.Models;

public class AppUser : IdentityUser
{
    // Add additional properties for your user here
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public string? ProfileImageUrl { get; set; }
    
    // Navigation properties
    public ICollection<Board> Boards { get; set; } = new List<Board>();
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
} 
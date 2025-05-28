using System.ComponentModel.DataAnnotations;

namespace SanalAniPanosu.API.DTOs;

/// <summary>
/// DTO for creating a new post
/// </summary>
public class PostCreateDto
{
    [Required]
    public int BoardId { get; set; }
    
    [Required]
    [StringLength(100)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(2000)]
    public string Content { get; set; } = string.Empty;
    
    [Required]
    public string ImageUrl { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string? Note { get; set; }
}

/// <summary>
/// DTO for returning post data in responses
/// </summary>
public class PostResponseDto
{
    public int Id { get; set; }
    public int BoardId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string? Note { get; set; }
    public string UserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
} 
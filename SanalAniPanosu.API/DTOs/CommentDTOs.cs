using System.ComponentModel.DataAnnotations;

namespace SanalAniPanosu.API.DTOs;

/// <summary>
/// DTO for creating a new comment
/// </summary>
public class CommentCreateDto
{
    [Required]
    public int BoardId { get; set; }
    
    public int? PostId { get; set; }
    
    [Required]
    [StringLength(2000)]
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// DTO for returning comment data in responses
/// </summary>
public class CommentResponseDto
{
    public int Id { get; set; }
    public int BoardId { get; set; }
    public int? PostId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Text { get; set; } = string.Empty; // For frontend compatibility
    public string UserId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty; // For frontend compatibility
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
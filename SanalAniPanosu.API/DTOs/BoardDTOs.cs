using System.ComponentModel.DataAnnotations;

namespace SanalAniPanosu.API.DTOs;

/// <summary>
/// DTO for creating a new board
/// </summary>
public class BoardCreateDto
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public bool IsPublic { get; set; } = true;
    
    public string? CoverImage { get; set; }
}

/// <summary>
/// DTO for updating an existing board
/// </summary>
public class BoardUpdateDto
{
    [Required]
    [StringLength(100, MinimumLength = 3)]
    public string Title { get; set; } = string.Empty;
    
    [StringLength(500)]
    public string Description { get; set; } = string.Empty;
    
    public bool IsPublic { get; set; }
    
    public string? CoverImage { get; set; }
}

/// <summary>
/// DTO for returning board data in responses
/// </summary>
public class BoardResponseDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty; 
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? CoverImage { get; set; }
    public string? CreatedBy { get; set; }
}
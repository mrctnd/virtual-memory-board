using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanalAniPanosu.API.Data;
using SanalAniPanosu.API.Models;
using System.Security.Claims;

namespace SanalAniPanosu.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PostsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly ILogger<PostsController> _logger;

    public PostsController(
        ApplicationDbContext context,
        UserManager<AppUser> userManager,
        ILogger<PostsController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    // POST: api/posts
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostDto createPostDto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Check if the board exists
            var board = await _context.Boards.FindAsync(createPostDto.BoardId);
            if (board == null)
            {
                return NotFound("Board not found");
            }

            // Check if the user owns the board
            if (board.UserId != userId)
            {
                return Forbid("You can only create posts in your own boards");
            }

            // Create the post
            var post = new Post
            {
                BoardId = createPostDto.BoardId,
                Note = createPostDto.Note,
                ImageUrl = createPostDto.ImagePath,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Posts.Add(post);
            await _context.SaveChangesAsync();

            // Return the created post
            return CreatedAtAction(nameof(GetPostsByBoardId), new { boardId = post.BoardId }, new PostResponseDto
            {
                Id = post.Id,
                BoardId = post.BoardId,
                ImageUrl = post.ImageUrl,
                Note = post.Note,
                CreatedAt = post.CreatedAt,
                UserId = post.UserId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating post");
            return StatusCode(500, "An error occurred while creating the post");
        }
    }

    // GET: api/posts/board/{boardId}
    [HttpGet("board/{boardId}")]
    public async Task<IActionResult> GetPostsByBoardId(int boardId)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Check if the board exists
            var board = await _context.Boards.FindAsync(boardId);
            if (board == null)
            {
                return NotFound("Board not found");
            }

            // Check if the user can access this board
            if (!board.IsPublic && board.UserId != userId)
            {
                return Forbid("You do not have permission to view this board's posts");
            }

            // Get the posts
            var posts = await _context.Posts
                .Where(p => p.BoardId == boardId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PostResponseDto
                {
                    Id = p.Id,
                    BoardId = p.BoardId,
                    ImageUrl = p.ImageUrl,
                    Note = p.Note,
                    CreatedAt = p.CreatedAt,
                    UserId = p.UserId
                })
                .ToListAsync();

            return Ok(posts);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving posts for board ID {BoardId}", boardId);
            return StatusCode(500, "An error occurred while retrieving posts");
        }
    }

    // DELETE: api/posts/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(int id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Find the post with its board
            var post = await _context.Posts
                .Include(p => p.Board)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (post == null)
            {
                return NotFound("Post not found");
            }

            // Check if the user owns the board
            if (post.Board?.UserId != userId)
            {
                return Forbid("You can only delete posts from boards you own");
            }

            // Delete the post
            _context.Posts.Remove(post);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting post with ID {PostId}", id);
            return StatusCode(500, "An error occurred while deleting the post");
        }
    }
}

// DTOs
public class CreatePostDto
{
    public int BoardId { get; set; }
    public string Note { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
}

public class PostResponseDto
{
    public int Id { get; set; }
    public int BoardId { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public string UserId { get; set; } = string.Empty;
} 
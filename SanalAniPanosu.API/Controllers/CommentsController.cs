// filepath: c:\Users\itach\project\SanalAniPanosu.API\Controllers\CommentsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanalAniPanosu.API.Data;
using SanalAniPanosu.API.DTOs;
using SanalAniPanosu.API.Models;
using System.Security.Claims;

namespace SanalAniPanosu.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class CommentsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly ILogger<CommentsController> _logger;

    public CommentsController(
        ApplicationDbContext context,
        UserManager<AppUser> userManager,
        ILogger<CommentsController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    // POST: api/comments
    [HttpPost]
    public async Task<IActionResult> AddComment([FromBody] CommentCreateDto createCommentDto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Check if the board exists
            var board = await _context.Boards.FindAsync(createCommentDto.BoardId);
            if (board == null)
            {
                return NotFound("Board not found");
            }

            // Check if the user can comment on this board
            if (!board.IsPublic && board.UserId != userId)
            {
                return Forbid("You do not have permission to comment on this board");
            }

            // Create the comment
            var comment = new Comment
            {
                BoardId = createCommentDto.BoardId,
                Content = createCommentDto.Content,
                PostId = createCommentDto.PostId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();

            // Get the username for the response
            var user = await _userManager.FindByIdAsync(userId);

            // Return the created comment
            return CreatedAtAction(nameof(GetBoardComments), new { boardId = comment.BoardId }, new CommentResponseDto
            {
                Id = comment.Id,
                BoardId = comment.BoardId ?? 0,
                PostId = comment.PostId,
                Content = comment.Content,
                Text = comment.Content, // For frontend compatibility
                CreatedAt = comment.CreatedAt,
                UserId = comment.UserId,
                UserName = user?.UserName ?? "Unknown User",
                CreatedBy = user?.UserName ?? "Unknown User" // For frontend compatibility
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding comment");
            return StatusCode(500, "An error occurred while adding the comment");
        }
    }

    // GET: api/comments/board/{boardId}
    [HttpGet("board/{boardId}")]
    public async Task<IActionResult> GetBoardComments(int boardId)
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
                return Forbid("You do not have permission to view this board's comments");
            }

            // Get the comments
            var comments = await _context.Comments
                .Where(c => c.BoardId == boardId)
                .Include(c => c.User)
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => new CommentResponseDto
                {
                    Id = c.Id,
                    BoardId = c.BoardId ?? 0,
                    PostId = c.PostId,
                    Content = c.Content,
                    Text = c.Content, // For frontend compatibility
                    CreatedAt = c.CreatedAt,
                    UserId = c.UserId,
                    UserName = c.User.UserName ?? "Unknown User",
                    CreatedBy = c.User.UserName ?? "Unknown User" // For frontend compatibility
                })
                .ToListAsync();

            return Ok(comments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for board ID {BoardId}", boardId);
            return StatusCode(500, "An error occurred while retrieving comments");
        }
    }

    // DELETE: api/comments/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(int id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            // Find the comment with its board
            var comment = await _context.Comments
                .Include(c => c.Board)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment == null)
            {
                return NotFound("Comment not found");
            }

            // Check if the user is the comment owner or the board owner
            bool isCommentOwner = comment.UserId == userId;
            bool isBoardOwner = comment.Board?.UserId == userId;

            if (!isCommentOwner && !isBoardOwner)
            {
                return Forbid("You can only delete your own comments or comments on boards you own");
            }

            // Delete the comment
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting comment with ID {CommentId}", id);
            return StatusCode(500, "An error occurred while deleting the comment");
        }
    }
}

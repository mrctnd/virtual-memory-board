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
public class BoardsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    private readonly ILogger<BoardsController> _logger;

    public BoardsController(
        ApplicationDbContext context,
        UserManager<AppUser> userManager,
        ILogger<BoardsController> logger)
    {
        _context = context;
        _userManager = userManager;
        _logger = logger;
    }

    // GET: api/boards
    [HttpGet]
    public async Task<IActionResult> GetUserBoards()
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }            var boards = await _context.Boards
                .Where(b => b.UserId == userId)
                .Include(b => b.User)
                .Select(b => new BoardResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Description = b.Description,
                    IsPublic = b.IsPublic,
                    CreatedAt = b.CreatedAt,
                    UserId = b.UserId,
                    CoverImage = b.CoverImage,
                    CreatedBy = b.User != null ? b.User.UserName : null
                })
                .ToListAsync();

            return Ok(boards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user boards");
            return StatusCode(500, "An error occurred while retrieving boards");
        }
    }

    // GET: api/boards/public
    [HttpGet("public")]
    public async Task<IActionResult> GetPublicBoards()
    {
        try
        {            var boards = await _context.Boards
                .Where(b => b.IsPublic)
                .Include(b => b.User)
                .Select(b => new BoardResponseDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    Description = b.Description,
                    IsPublic = b.IsPublic,
                    CreatedAt = b.CreatedAt,
                    UserId = b.UserId,
                    CoverImage = b.CoverImage,
                    CreatedBy = b.User != null ? b.User.UserName : null
                })
                .ToListAsync();

            return Ok(boards);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving public boards");
            return StatusCode(500, "An error occurred while retrieving public boards");
        }
    }

    // GET: api/boards/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetBoard(int id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var board = await _context.Boards
                .Include(b => b.User)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (board == null)
            {
                return NotFound("Board not found");
            }

            // Check if user has access to this board
            if (!board.IsPublic && board.UserId != userId)
            {
                return Forbid();
            }            return Ok(new BoardResponseDto
            {
                Id = board.Id,
                Title = board.Title,
                Description = board.Description,
                IsPublic = board.IsPublic,
                CreatedAt = board.CreatedAt,
                UserId = board.UserId,
                CoverImage = board.CoverImage,
                CreatedBy = board.User?.UserName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving board with ID {BoardId}", id);
            return StatusCode(500, "An error occurred while retrieving the board");
        }
    }

    // POST: api/boards
    [HttpPost]
    public async Task<IActionResult> CreateBoard(BoardCreateDto createBoardDto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }            var board = new Board
            {
                Title = createBoardDto.Title,
                Description = createBoardDto.Description,
                IsPublic = createBoardDto.IsPublic,
                CoverImage = createBoardDto.CoverImage,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Boards.Add(board);
            await _context.SaveChangesAsync();

            // Get the user information for the response
            var user = await _userManager.FindByIdAsync(userId);

            return CreatedAtAction(nameof(GetBoard), new { id = board.Id }, new BoardResponseDto
            {
                Id = board.Id,
                Title = board.Title,
                Description = board.Description,
                IsPublic = board.IsPublic,
                CreatedAt = board.CreatedAt,
                UserId = board.UserId,
                CoverImage = board.CoverImage,
                CreatedBy = user?.UserName
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating board");
            return StatusCode(500, "An error occurred while creating the board");
        }
    }

    // PUT: api/boards/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBoard(int id, BoardUpdateDto updateBoardDto)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var board = await _context.Boards.FindAsync(id);
            if (board == null)
            {
                return NotFound("Board not found");
            }

            // Check if user is the owner
            if (board.UserId != userId)
            {
                return Forbid();
            }            // Update properties
            board.Title = updateBoardDto.Title;
            board.Description = updateBoardDto.Description;
            board.IsPublic = updateBoardDto.IsPublic;
            board.CoverImage = updateBoardDto.CoverImage;
            board.UpdatedAt = DateTime.UtcNow;

            _context.Entry(board).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BoardExists(id))
                {
                    return NotFound("Board not found");
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating board with ID {BoardId}", id);
            return StatusCode(500, "An error occurred while updating the board");
        }
    }

    // DELETE: api/boards/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBoard(int id)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var board = await _context.Boards.FindAsync(id);
            if (board == null)
            {
                return NotFound("Board not found");
            }

            // Check if user is the owner
            if (board.UserId != userId)
            {
                return Forbid();
            }

            _context.Boards.Remove(board);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting board with ID {BoardId}", id);
            return StatusCode(500, "An error occurred while deleting the board");
        }
    }

    private bool BoardExists(int id)
    {
        return _context.Boards.Any(e => e.Id == id);
    }
} 
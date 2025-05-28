using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanalAniPanosu.API.Data;
using SanalAniPanosu.API.Models;
using SanalAniPanosu.API.DTOs;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace SanalAniPanosu.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class UserController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<UserController> _logger;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public UserController(
        UserManager<AppUser> userManager,
        ApplicationDbContext context,
        ILogger<UserController> logger,
        IWebHostEnvironment webHostEnvironment)
    {
        _userManager = userManager;
        _context = context;
        _logger = logger;
        _webHostEnvironment = webHostEnvironment;
    }    // This endpoint requires authentication
    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        // Get user statistics
        var boardsCount = await _context.Boards.CountAsync(b => b.UserId == userId);
        var postsCount = await _context.Posts.CountAsync(p => p.UserId == userId);
        var commentsCount = await _context.Comments.CountAsync(c => c.UserId == userId);

        return Ok(new
        {
            id = user.Id,
            username = user.UserName,
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName,
            profileImageUrl = user.ProfileImageUrl,
            createdAt = user.CreatedAt,
            boardsCount = boardsCount,
            postsCount = postsCount,
            commentsCount = commentsCount
        });
    }// Example of role-based authorization
    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminOnly()
    {
        return Ok(new { message = "You have access to admin resources" });
    }
    
    // Upload profile image using form data
    [HttpPost("profile-image")]
    [Authorize]
    public async Task<IActionResult> UploadProfileImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Get the current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Create the uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_webHostEnvironment.ContentRootPath, "Uploads", "ProfileImages");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate a unique file name
            var fileExtension = Path.GetExtension(file.FileName);
            var fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Build the relative path for the response
            var profileImageUrl = $"Uploads/ProfileImages/{fileName}";

            // Update the user's profile image URL
            user.ProfileImageUrl = profileImageUrl;
            user.UpdatedAt = DateTime.UtcNow;

            // Save the changes
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { 
                    message = "Profile image uploaded successfully",
                    profileImage = profileImageUrl 
                });
            }
            else
            {
                return BadRequest(result.Errors);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile image");
            return StatusCode(500, "An error occurred while uploading profile image");
        }
    }
    
    // Get public user information by ID
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        try
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("User ID is required");
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Return only public fields
            return Ok(new
            {
                id = user.Id,
                username = user.UserName,
                profileImageUrl = user.ProfileImageUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by ID");
            return StatusCode(500, "An error occurred while retrieving user information");
        }
    }
    
    // Update profile image endpoint
    [HttpPut("profile-image")]
    [Authorize]
    public async Task<IActionResult> UpdateProfileImage([FromBody] ProfileImageUpdateDto model)
    {
        try
        {
            // Get the current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Handle the profile image
            string profileImageUrl;
            
            // Check if the input is a base64 string
            if (IsBase64String(model.ImageData))
            {
                // Handle base64 image data
                profileImageUrl = await SaveBase64ImageAsync(model.ImageData, userId);
            }
            else
            {
                // Treat as a file path from previous upload
                profileImageUrl = model.ImageData;
            }

            // Update the user's profile image URL
            user.ProfileImageUrl = profileImageUrl;
            user.UpdatedAt = DateTime.UtcNow;

            // Save the changes
            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
            {
                return Ok(new { 
                    message = "Profile image updated successfully",
                    profileImageUrl = profileImageUrl 
                });
            }
            else
            {
                return BadRequest(result.Errors);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating profile image");
            return StatusCode(500, "An error occurred while updating profile image");
        }
    }

    // Helper method to check if a string is base64 encoded
    private bool IsBase64String(string s)
    {
        if (string.IsNullOrWhiteSpace(s))
            return false;

        // Check if the string starts with a data URL pattern
        if (s.StartsWith("data:image"))
        {
            return true;
        }

        // Otherwise check if it's a regular base64 string
        s = s.Trim();
        return (s.Length % 4 == 0) && Regex.IsMatch(s, @"^[a-zA-Z0-9\+/]*={0,3}$", RegexOptions.None);
    }

    // Helper method to save a base64 image to the file system
    private async Task<string> SaveBase64ImageAsync(string base64String, string userId)
    {
        try
        {
            // Extract the base64 data if it's a data URL
            string base64Data = base64String;
            string fileExtension = ".jpg"; // Default extension

            if (base64String.StartsWith("data:image"))
            {
                var parts = base64String.Split(',');
                if (parts.Length > 1)
                {
                    base64Data = parts[1];
                    
                    // Try to extract the file extension from the data URL
                    var match = Regex.Match(parts[0], @"data:image\/([a-zA-Z0-9]+);base64");
                    if (match.Success && match.Groups.Count > 1)
                    {
                        fileExtension = "." + match.Groups[1].Value;
                    }
                }
            }

            byte[] imageBytes = Convert.FromBase64String(base64Data);

            // Create the uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_webHostEnvironment.ContentRootPath, "Uploads", "ProfileImages");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Create a unique filename
            string fileName = $"{userId}_{Guid.NewGuid()}{fileExtension}";
            string filePath = Path.Combine(uploadsFolder, fileName);

            // Save the file
            await System.IO.File.WriteAllBytesAsync(filePath, imageBytes);

            // Return the relative path
            return $"Uploads/ProfileImages/{fileName}";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving base64 image");            throw;
        }
    }

    // Update account information (username and email)
    [HttpPut("update-account")]
    [Authorize]
    public async Task<IActionResult> UpdateAccountInfo([FromBody] UpdateAccountDto model)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            // Check if username is already taken by another user
            if (!string.IsNullOrEmpty(model.Username) && model.Username != user.UserName)
            {
                var existingUser = await _userManager.FindByNameAsync(model.Username);
                if (existingUser != null && existingUser.Id != userId)
                {
                    return BadRequest("Username is already taken");
                }
                user.UserName = model.Username;
            }

            // Check if email is already taken by another user
            if (!string.IsNullOrEmpty(model.Email) && model.Email != user.Email)
            {
                var existingUser = await _userManager.FindByEmailAsync(model.Email);
                if (existingUser != null && existingUser.Id != userId)
                {
                    return BadRequest("Email is already taken");
                }
                user.Email = model.Email;
            }

            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return Ok(new
                {
                    id = user.Id,
                    username = user.UserName,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    profileImageUrl = user.ProfileImageUrl
                });
            }
            else
            {
                return BadRequest(result.Errors);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating account information");
            return StatusCode(500, "An error occurred while updating account information");
        }
    }

    // Update personal information (first name and last name)
    [HttpPut("update-personal")]
    [Authorize]
    public async Task<IActionResult> UpdatePersonalInfo([FromBody] UpdatePersonalDto model)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            if (!string.IsNullOrEmpty(model.FirstName))
            {
                user.FirstName = model.FirstName;
            }

            if (!string.IsNullOrEmpty(model.LastName))
            {
                user.LastName = model.LastName;
            }

            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                return Ok(new
                {
                    id = user.Id,
                    username = user.UserName,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    profileImageUrl = user.ProfileImageUrl
                });
            }
            else
            {
                return BadRequest(result.Errors);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating personal information");
            return StatusCode(500, "An error occurred while updating personal information");
        }
    }

    // Change password
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        try
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (result.Succeeded)
            {
                user.UpdatedAt = DateTime.UtcNow;
                await _userManager.UpdateAsync(user);
                
                return Ok(new { message = "Password changed successfully" });
            }
            else
            {
                return BadRequest(result.Errors);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password");
            return StatusCode(500, "An error occurred while changing password");
        }
    }
}

// DTO for profile image update
public class ProfileImageUpdateDto
{
    public string ImageData { get; set; } = string.Empty;
} 
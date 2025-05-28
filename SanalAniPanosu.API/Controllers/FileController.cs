// filepath: c:\Users\itach\project\SanalAniPanosu.API\Controllers\FileController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace SanalAniPanosu.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class FileController : ControllerBase
{
    private readonly IWebHostEnvironment _webHostEnvironment;
    private readonly ILogger<FileController> _logger;
    private readonly IConfiguration _configuration;

    public FileController(
        IWebHostEnvironment webHostEnvironment, 
        ILogger<FileController> logger,
        IConfiguration configuration)
    {
        _webHostEnvironment = webHostEnvironment;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadFile(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded");
            }

            // Get configuration settings
            var maxFileSizeMB = _configuration.GetValue<int>("FileUpload:MaxFileSizeMB");
            var allowedExtensions = _configuration.GetSection("FileUpload:AllowedExtensions").Get<string[]>();
            var uploadPath = _configuration.GetValue<string>("FileUpload:UploadPath") ?? "Uploads";

            // Check file size
            if (file.Length > maxFileSizeMB * 1024 * 1024)
            {
                return BadRequest($"File size exceeds the limit of {maxFileSizeMB} MB");
            }

            // Validate file type
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            
            if (allowedExtensions == null || !allowedExtensions.Contains(fileExtension))
            {
                return BadRequest("Invalid file type. Allowed types: " + string.Join(", ", allowedExtensions ?? new[] { ".jpg", ".jpeg", ".png", ".gif" }));
            }

            // Create uploads directory if it doesn't exist
            var uploadsFolder = Path.Combine(_webHostEnvironment.ContentRootPath, uploadPath);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Generate a unique file name
            var uniqueFileName = Guid.NewGuid().ToString() + fileExtension;
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Build the relative path for the response
            var relativePath = Path.Combine(uploadPath, uniqueFileName);
            
            // Convert backslashes to forward slashes for web URLs
            var webPath = relativePath.Replace("\\", "/");

            _logger.LogInformation("File uploaded successfully: {FilePath}", webPath);

            return Ok(new { 
                filePath = webPath,
                path = webPath, // Added for frontend compatibility
                fileName = uniqueFileName,
                originalFileName = file.FileName,
                fileSize = file.Length,
                fileType = file.ContentType
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file");
            return StatusCode(500, "Internal server error: " + ex.Message);
        }
    }
}

using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SanalAniPanosu.API.Models;

namespace SanalAniPanosu.API.Data;

public class ApplicationDbContext : IdentityDbContext<AppUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }
    
    // Define DbSet properties
    public DbSet<Board> Boards { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<Comment> Comments { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Configure table names
        builder.Entity<AppUser>().ToTable("AspNetUsers");
        builder.Entity<Board>().ToTable("Boards");
        builder.Entity<Post>().ToTable("Posts");
        builder.Entity<Comment>().ToTable("Comments");
        
        // Configure Board relationships
        builder.Entity<Board>()
            .HasOne(b => b.User)
            .WithMany(u => u.Boards)
            .HasForeignKey(b => b.UserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Configure Post relationships
        builder.Entity<Post>()
            .HasOne(p => p.Board)
            .WithMany(b => b.Posts)
            .HasForeignKey(p => p.BoardId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.Entity<Post>()
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Configure Comment relationships
        builder.Entity<Comment>()
            .HasOne(c => c.Post)
            .WithMany(p => p.Comments)
            .HasForeignKey(c => c.PostId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.Entity<Comment>()
            .HasOne(c => c.Board)
            .WithMany(b => b.Comments)
            .HasForeignKey(c => c.BoardId)
            .OnDelete(DeleteBehavior.Cascade);
            
        builder.Entity<Comment>()
            .HasOne(c => c.User)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Restrict);
            
        // Configure required fields and column types
        builder.Entity<Post>()
            .Property(p => p.Title)
            .IsRequired()
            .HasMaxLength(255);
            
        builder.Entity<Post>()
            .Property(p => p.ImageUrl)
            .IsRequired();
            
        builder.Entity<Comment>()
            .Property(c => c.Content)
            .IsRequired()
            .HasMaxLength(1000);
            
        builder.Entity<Board>()
            .Property(b => b.Title)
            .IsRequired()
            .HasMaxLength(100);
    }
    
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        // This will only be used if the context is created without passing options to the constructor
        if (!optionsBuilder.IsConfigured)
        {
            // Use your connection string from appsettings.json if needed as fallback
            // This shouldn't typically be needed if DI is set up correctly
        }
    }
} 
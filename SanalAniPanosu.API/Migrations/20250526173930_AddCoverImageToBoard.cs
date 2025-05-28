using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SanalAniPanosu.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverImageToBoard : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CoverImage",
                table: "Boards",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CoverImage",
                table: "Boards");
        }
    }
}

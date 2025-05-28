using AutoMapper;
using SanalAniPanosu.API.DTOs;
using SanalAniPanosu.API.Models;

namespace SanalAniPanosu.API.Mapping;

public class CommentProfile : Profile
{
    public CommentProfile()
    {
        // Map CommentCreateDto to Comment
        CreateMap<CommentCreateDto, Comment>();
        
        // Map Comment to CommentResponseDto
        CreateMap<Comment, CommentResponseDto>();
    }
} 
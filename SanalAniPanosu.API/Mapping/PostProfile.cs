using AutoMapper;
using SanalAniPanosu.API.DTOs;
using SanalAniPanosu.API.Models;

namespace SanalAniPanosu.API.Mapping;

public class PostProfile : Profile
{
    public PostProfile()
    {
        // Map PostCreateDto to Post
        CreateMap<PostCreateDto, Post>();
        
        // Map Post to PostResponseDto
        CreateMap<Post, PostResponseDto>();
    }
} 
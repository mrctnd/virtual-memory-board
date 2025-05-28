using AutoMapper;
using SanalAniPanosu.API.DTOs;
using SanalAniPanosu.API.Models;

namespace SanalAniPanosu.API.Mapping;

public class UserProfile : Profile
{
    public UserProfile()
    {
        // Map AppUser to UserResponseDto
        CreateMap<AppUser, UserResponseDto>();
    }
} 
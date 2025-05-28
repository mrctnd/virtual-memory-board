using AutoMapper;
using SanalAniPanosu.API.DTOs;
using SanalAniPanosu.API.Models;

namespace SanalAniPanosu.API.Mapping;

public class BoardProfile : Profile
{
    public BoardProfile()
    {
        // Map BoardCreateDto to Board
        CreateMap<BoardCreateDto, Board>();
        
        // Map BoardUpdateDto to Board
        CreateMap<BoardUpdateDto, Board>();
        
        // Map Board to BoardResponseDto
        CreateMap<Board, BoardResponseDto>();
    }
} 
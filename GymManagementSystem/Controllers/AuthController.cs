using GymManagementSystem.Data;
using GymManagementSystem.Models;
using GymManagementSystem.Models.DTOs;
using GymManagementSystem.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
namespace GymManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext _context;
        private readonly NumberGeneratorService _numberGenerator;

        public AuthController(
             UserManager<ApplicationUser> userManager,
             IConfiguration configuration,
             ApplicationDbContext context,
             NumberGeneratorService numberGenerator)
        {
            _userManager = userManager;
            _configuration = configuration;
            _context = context;
            _numberGenerator = numberGenerator;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(
                request.Email);

            if (existingUser is not null)
            {
                return BadRequest(new
                {
                    message = "A user with this email already exists."
                });
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var user = new ApplicationUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    Name = request.Name,
                    Surname = request.Surname
                };

                var result = await _userManager.CreateAsync(
                    user,
                    request.Password);

                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message = "Could not create account.",
                        errors = result.Errors.Select(
                            e => e.Description)
                    });
                }

                var roleResult = await _userManager.AddToRoleAsync(
                    user,
                    "GymMember");

                if (!roleResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message = "Could not assign GymMember role.",
                        errors = roleResult.Errors.Select(
                            e => e.Description)
                    });
                }

                // Generate unique member number
                string memberNumber;

                do
                {
                    memberNumber =
                        _numberGenerator.Generate("GM");
                }
                while (await _context.GymMembers
                    .AnyAsync(m =>
                        m.MemberNumber == memberNumber));

                // Create GymMember profile
                var gymMember = new GymMember
                {
                    ApplicationUserId = user.Id,

                    MemberNumber = memberNumber,

                    Name = request.Name,
                    Surname = request.Surname,
                    Gender = request.Gender,
                    DateOfBirth = request.DateOfBirth,
                    HomeAddress = request.HomeAddress,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    MembershipType = request.MembershipType,

                    PersonalTrainerId = null
                };

                _context.GymMembers.Add(gymMember);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Gym member registered successfully.",
                    memberNumber = gymMember.MemberNumber
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message =
                        "An error occurred while registering the gym member."
                });
            }
        }

        //LOGIN ENDPOINT
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var passwordValid = await _userManager.CheckPasswordAsync(
                user,
                request.Password
            );

            if (!passwordValid)
            {
                return Unauthorized(new
                {
                    message = "Invalid email or password."
                });
            }

            var roles = await _userManager.GetRolesAsync(user);

            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id
                ),

                new Claim(
                    ClaimTypes.Email,
                    user.Email ?? string.Empty
                ),

                new Claim(
                    ClaimTypes.Name,
                     $"{user.Name} {user.Surname}"
                )
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var jwtKey = _configuration["Jwt:Key"];

            if (string.IsNullOrEmpty(jwtKey))
            {
                return StatusCode(500, new
                {
                    message = "JWT configuration is missing."
                });
            }

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var duration = _configuration.GetValue<int>(
                "Jwt:DurationInMinutes");

            if (duration <= 0)
            {
                return StatusCode(500, new
                {
                    message = "JWT duration configuration is invalid."
                });
            }

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(duration),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler()
                .WriteToken(token);

            return Ok(new
            {
                message = "Login successful.",
                token = tokenString,
                user = new
                {
                    user.Id,
                    user.Name,
                    user.Surname,
                    user.Email,
                    roles
                }
            });
        }
    }
}

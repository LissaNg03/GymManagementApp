using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class CreatePersonalTrainerRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Surname { get; set; } = string.Empty;

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string Specialization { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}
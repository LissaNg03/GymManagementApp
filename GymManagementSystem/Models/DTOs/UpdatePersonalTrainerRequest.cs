using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class UpdatePersonalTrainerRequest
    {
        public string? Name { get; set; }

        public string? Surname { get; set; }

        public string? Gender { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }

        public string? Specialization { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
namespace GymManagementSystem.Models
{
    public class GymMember
    {
        [Key]
        public int GymMemberId { get; set; }

        // Links this gym member to their Identity account
        public string? ApplicationUserId { get; set; }

        // Navigation Property
        public ApplicationUser? ApplicationUser { get; set; }

        [Required]
        public string MemberNumber { get; set; } = string.Empty;

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Surname { get; set; } = string.Empty;

        [Required]
        public string Gender { get; set; } = string.Empty;

        [Required]
        public DateTime DateOfBirth { get; set; }

        [Required]
        public string HomeAddress { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        public string? PhoneNumber { get; set; }

        [Required]
        public string MembershipType { get; set; } = string.Empty;

        // Foreign Key
        public int? PersonalTrainerId { get; set; }

        // Navigation Property
        public PersonalTrainer? PersonalTrainer { get; set; } = null!;

        // Navigation Property
        public ICollection<WorkoutPlan> WorkoutPlans { get; set; }
            = new List<WorkoutPlan>();
    }
}
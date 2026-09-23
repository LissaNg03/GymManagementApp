using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models
{
    public class PersonalTrainer
    {
        [Key]
        public int PersonalTrainerId { get; set; }

        public string? ApplicationUserId { get; set; }

        public ApplicationUser? ApplicationUser { get; set; }

        [Required]
        public string StaffNumber { get; set; } = string.Empty;

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

        // Navigation Property
        public ICollection<GymMember> GymMembers { get; set; }
            = new List<GymMember>();
    }
}
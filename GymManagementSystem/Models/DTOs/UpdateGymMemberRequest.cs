using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class UpdateGymMemberRequest
    {
        public string? Name { get; set; }

        public string? Surname { get; set; }

        public string? Gender { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? HomeAddress { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public string? PhoneNumber { get; set; }
        public string? MembershipType { get; set; }

        // Foreign Key
        public int? PersonalTrainerId { get; set; }
    }
}

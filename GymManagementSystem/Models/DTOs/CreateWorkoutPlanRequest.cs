using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class CreateWorkoutPlanRequest
    {
        [Required]
        public string PlanName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int GymMemberId { get; set; }

        [Required]
        public int TrainingProgrammeId { get; set; }
    }
}
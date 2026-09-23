using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class AssignTrainingProgrammeRequest
    {
        [Required]
        public int TrainingProgrammeId { get; set; }

        [Required]
        public string PlanName { get; set; } = string.Empty;

        public string? Description { get; set; }
    }
}
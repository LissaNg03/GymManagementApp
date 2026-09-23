using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class CreateTrainingProgrammeRequest
    {
        [Required]
        public string ProgrammeName { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int Duration { get; set; }

        [Required]
        public string FitnessGoal { get; set; } = string.Empty;
    }
}
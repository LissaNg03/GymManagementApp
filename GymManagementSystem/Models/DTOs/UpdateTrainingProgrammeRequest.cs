using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class UpdateTrainingProgrammeRequest
    {
        public string? ProgrammeName { get; set; }

        public string? Description { get; set; }

        public int? Duration { get; set; }

        public string? FitnessGoal { get; set; }
    }
}
using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models
{
    public class TrainingProgramme
    {
        [Key]
        public int TrainingProgrammeId { get; set; }

        [Required]
        public string ProgrammeName { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public int Duration { get; set; }

        [Required]
        public string FitnessGoal { get; set; } = string.Empty;

        // Navigation Property
        public ICollection<WorkoutPlan> WorkoutPlans { get; set; }
            = new List<WorkoutPlan>();
    }
}
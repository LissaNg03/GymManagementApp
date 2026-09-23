using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models
{
    public class WorkoutTask
    {
        [Key]
        public int WorkoutTaskId { get; set; }

        [Required]
        public string ExerciseName { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public int Sets { get; set; }

        [Required]
        public int Repetitions { get; set; }

        [Required]
        public DateTime WorkoutDate { get; set; }

        [Required]
        public string Status { get; set; } = "Not Started";

        // Foreign Key
        public int WorkoutPlanId { get; set; }

        // Navigation Property
        public WorkoutPlan WorkoutPlan { get; set; } = null!;
    }
}
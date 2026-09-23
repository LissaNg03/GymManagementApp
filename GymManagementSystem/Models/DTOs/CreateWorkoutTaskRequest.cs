using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class CreateWorkoutTaskRequest
    {
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
        public int WorkoutPlanId { get; set; }
    }
}
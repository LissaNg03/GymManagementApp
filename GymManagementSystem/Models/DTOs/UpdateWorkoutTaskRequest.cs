using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class UpdateWorkoutTaskRequest
    {
        public string? ExerciseName { get; set; }

        public string? Description { get; set; }

        public int? Sets { get; set; }

        public int? Repetitions { get; set; }

        public DateTime? WorkoutDate { get; set; }
    }
}
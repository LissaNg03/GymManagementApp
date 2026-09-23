using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models
{
    public class WorkoutPlan
    {
        [Key]
        public int WorkoutPlanId { get; set; }

        [Required]
        public string PlanName { get; set; } = string.Empty;

        public string? Description { get; set; }

        // Foreign Key → GymMember
        public int GymMemberId { get; set; }

        // Foreign Key → TrainingProgramme
        public int TrainingProgrammeId { get; set; }

        // Navigation Properties
        public GymMember GymMember { get; set; } = null!;

        public TrainingProgramme TrainingProgramme { get; set; } = null!;

        // Navigation Property
        public ICollection<WorkoutTask> WorkoutTasks { get; set; }
            = new List<WorkoutTask>();
    }
}
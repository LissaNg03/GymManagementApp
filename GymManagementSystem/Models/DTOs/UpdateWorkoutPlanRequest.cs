namespace GymManagementSystem.Models.DTOs
{
    public class UpdateWorkoutPlanRequest
    {
        public string? PlanName { get; set; }

        public string? Description { get; set; }

        public int? GymMemberId { get; set; }

        public int? TrainingProgrammeId { get; set; }
    }
}
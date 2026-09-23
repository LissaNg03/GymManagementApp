using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class AssignTrainerRequest
    {
        [Required]
        public int PersonalTrainerId { get; set; }
    }
}
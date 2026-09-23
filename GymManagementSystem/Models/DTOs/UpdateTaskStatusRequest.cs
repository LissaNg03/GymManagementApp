using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class UpdateTaskStatusRequest
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
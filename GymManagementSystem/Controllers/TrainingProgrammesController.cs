using GymManagementSystem.Data;
using GymManagementSystem.Models;
using GymManagementSystem.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TrainingProgrammesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TrainingProgrammesController(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // ADD TRAINING PROGRAMME
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddTrainingProgramme(
            CreateTrainingProgrammeRequest request)
        {
            if (request.Duration <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "Duration must be greater than 0."
                });
            }

            var programme = new TrainingProgramme
            {
                ProgrammeName = request.ProgrammeName,
                Description = request.Description,
                Duration = request.Duration,
                FitnessGoal = request.FitnessGoal
            };

            _context.TrainingProgrammes.Add(programme);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetTrainingProgramme),
                new { id = programme.TrainingProgrammeId },
                new
                {
                    trainingProgrammeId =
                        programme.TrainingProgrammeId,

                    programmeName =
                        programme.ProgrammeName,

                    description =
                        programme.Description,

                    duration =
                        programme.Duration,

                    fitnessGoal =
                        programme.FitnessGoal,

                    message =
                        "Training programme created successfully."
                }
            );
        }


        // GET ALL TRAINING PROGRAMMES
        [HttpGet]
        public async Task<IActionResult> GetTrainingProgrammes()
        {
            var programmes = await _context.TrainingProgrammes
                .Select(tp => new
                {
                    trainingProgrammeId =
                        tp.TrainingProgrammeId,

                    programmeName =
                        tp.ProgrammeName,

                    description =
                        tp.Description,

                    duration =
                        tp.Duration,

                    fitnessGoal =
                        tp.FitnessGoal
                })
                .ToListAsync();

            return Ok(programmes);
        }


        // GET TRAINING PROGRAMME BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTrainingProgramme(
            int id)
        {
            var programme = await _context.TrainingProgrammes
                .Where(tp =>
                    tp.TrainingProgrammeId == id)
                .Select(tp => new
                {
                    trainingProgrammeId =
                        tp.TrainingProgrammeId,

                    programmeName =
                        tp.ProgrammeName,

                    description =
                        tp.Description,

                    duration =
                        tp.Duration,

                    fitnessGoal =
                        tp.FitnessGoal
                })
                .FirstOrDefaultAsync();

            if (programme is null)
            {
                return NotFound(new
                {
                    message =
                        "Training programme does not exist."
                });
            }

            return Ok(programme);
        }


        // UPDATE TRAINING PROGRAMME
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTrainingProgramme(
            int id,
            UpdateTrainingProgrammeRequest request)
        {
            var programme = await _context.TrainingProgrammes
                .FirstOrDefaultAsync(tp =>
                    tp.TrainingProgrammeId == id);

            if (programme is null)
            {
                return NotFound(new
                {
                    message =
                        "Training programme does not exist."
                });
            }

            if (request.Duration.HasValue &&
                request.Duration.Value <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "Duration must be greater than 0."
                });
            }

            programme.ProgrammeName =
                request.ProgrammeName ??
                programme.ProgrammeName;

            programme.Description =
                request.Description ??
                programme.Description;

            programme.Duration =
                request.Duration ??
                programme.Duration;

            programme.FitnessGoal =
                request.FitnessGoal ??
                programme.FitnessGoal;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                trainingProgrammeId =
                    programme.TrainingProgrammeId,

                programmeName =
                    programme.ProgrammeName,

                description =
                    programme.Description,

                duration =
                    programme.Duration,

                fitnessGoal =
                    programme.FitnessGoal,

                message =
                    "Training programme updated successfully."
            });
        }


        // DELETE TRAINING PROGRAMME
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTrainingProgramme(
            int id)
        {
            var programme = await _context.TrainingProgrammes
                .FirstOrDefaultAsync(tp =>
                    tp.TrainingProgrammeId == id);

            if (programme is null)
            {
                return NotFound(new
                {
                    message =
                        "Training programme does not exist."
                });
            }

            var isInUse = await _context.WorkoutPlans
                .AnyAsync(wp =>
                    wp.TrainingProgrammeId == id);

            if (isInUse)
            {
                return Conflict(new
                {
                    message =
                        "This training programme cannot be deleted because it is assigned to one or more workout plans."
                });
            }

            _context.TrainingProgrammes.Remove(programme);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Training programme deleted successfully."
            });
        }
    }
}
using System.Security.Claims;
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
    public class WorkoutTasksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkoutTasksController(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // CREATE WORKOUT TASK
        // Admin and Personal Trainer
        [HttpPost]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> CreateWorkoutTask(
            CreateWorkoutTaskRequest request)
        {
            if (request.Sets <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "Sets must be greater than 0."
                });
            }

            if (request.Repetitions <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "Repetitions must be greater than 0."
                });
            }

            var workoutPlan =
                await _context.WorkoutPlans
                    .Include(wp => wp.GymMember)
                    .FirstOrDefaultAsync(
                        wp => wp.WorkoutPlanId ==
                              request.WorkoutPlanId);

            if (workoutPlan is null)
            {
                return BadRequest(new
                {
                    message =
                        "The specified workout plan does not exist."
                });
            }


            // Personal Trainer ownership check
            if (User.IsInRole("PersonalTrainer"))
            {
                var userId =
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier);

                var trainer =
                    await _context.PersonalTrainers
                        .FirstOrDefaultAsync(
                            pt => pt.ApplicationUserId ==
                                  userId);

                if (trainer is null)
                {
                    return Forbid();
                }

                if (workoutPlan.GymMember
                        .PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }
            }


            var workoutTask = new WorkoutTask
            {
                ExerciseName =
                    request.ExerciseName,

                Description =
                    request.Description,

                Sets =
                    request.Sets,

                Repetitions =
                    request.Repetitions,

                WorkoutDate =
                    request.WorkoutDate,

                Status =
                    "Not Started",

                WorkoutPlanId =
                    request.WorkoutPlanId
            };

            _context.WorkoutTasks.Add(workoutTask);

            await _context.SaveChangesAsync();


            return CreatedAtAction(
                nameof(GetWorkoutTask),
                new
                {
                    id = workoutTask.WorkoutTaskId
                },
                new
                {
                    workoutTaskId =
                        workoutTask.WorkoutTaskId,

                    exerciseName =
                        workoutTask.ExerciseName,

                    description =
                        workoutTask.Description,

                    sets =
                        workoutTask.Sets,

                    repetitions =
                        workoutTask.Repetitions,

                    workoutDate =
                        workoutTask.WorkoutDate,

                    status =
                        workoutTask.Status,

                    workoutPlanId =
                        workoutTask.WorkoutPlanId,

                    message =
                        "Workout task created successfully."
                }
            );
        }


        // GET ALL WORKOUT TASKS
        // Admin
        [HttpGet]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> GetWorkoutTasks()
        {
            var query = _context.WorkoutTasks
                .Include(wt => wt.WorkoutPlan)
                .ThenInclude(wp => wp.GymMember)
                .AsQueryable();

            if (User.IsInRole("PersonalTrainer"))
            {
                var userId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier
                );

                var trainer = await _context.PersonalTrainers
                    .FirstOrDefaultAsync(
                        pt => pt.ApplicationUserId == userId
                    );

                if (trainer is null)
                {
                    return Forbid();
                }

                query = query.Where(wt =>
                    wt.WorkoutPlan.GymMember.PersonalTrainerId
                    == trainer.PersonalTrainerId
                );
            }

            var tasks = await query
                .Select(wt => new
                {
                    workoutTaskId = wt.WorkoutTaskId,

                    exerciseName = wt.ExerciseName,

                    description = wt.Description,

                    sets = wt.Sets,

                    repetitions = wt.Repetitions,

                    workoutDate = wt.WorkoutDate,

                    status = wt.Status,

                    workoutPlanId = wt.WorkoutPlanId,

                    planName = wt.WorkoutPlan.PlanName,

                    memberName = wt.WorkoutPlan.GymMember.Name,

                    memberSurname = wt.WorkoutPlan.GymMember.Surname
                })
                .ToListAsync();

            return Ok(tasks);
        }


        // GET ONE WORKOUT TASK
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkoutTask(
            int id)
        {
            var workoutTask =
                await _context.WorkoutTasks
                    .Include(wt => wt.WorkoutPlan)
                    .ThenInclude(wp => wp.GymMember)
                    .Include(wt => wt.WorkoutPlan)
                    .ThenInclude(wp => wp.TrainingProgramme)
                    .FirstOrDefaultAsync(
                        wt => wt.WorkoutTaskId == id);

            if (workoutTask is null)
            {
                return NotFound(new
                {
                    message =
                        "Workout task does not exist."
                });
            }


            // ADMIN
            if (User.IsInRole("Admin"))
            {
                return Ok(new
                {
                    workoutTaskId =
                        workoutTask.WorkoutTaskId,

                    exerciseName =
                        workoutTask.ExerciseName,

                    description =
                        workoutTask.Description,

                    sets =
                        workoutTask.Sets,

                    repetitions =
                        workoutTask.Repetitions,

                    workoutDate =
                        workoutTask.WorkoutDate,

                    status =
                        workoutTask.Status,

                    workoutPlanId =
                        workoutTask.WorkoutPlanId,

                    planName =
                        workoutTask.WorkoutPlan.PlanName,

                    memberId =
                        workoutTask.WorkoutPlan.GymMemberId,

                    memberName =
                        $"{workoutTask.WorkoutPlan.GymMember.Name} " +
                        $"{workoutTask.WorkoutPlan.GymMember.Surname}",

                    trainingProgrammeId =
                        workoutTask.WorkoutPlan.TrainingProgrammeId,

                    trainingProgramme =
                        workoutTask.WorkoutPlan
                            .TrainingProgramme
                            .ProgrammeName
                });
            }


            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);


            // PERSONAL TRAINER
            if (User.IsInRole("PersonalTrainer"))
            {
                var trainer =
                    await _context.PersonalTrainers
                        .FirstOrDefaultAsync(
                            pt => pt.ApplicationUserId ==
                                  userId);

                if (trainer is null)
                {
                    return Forbid();
                }

                if (workoutTask.WorkoutPlan
                        .GymMember.PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }

                return Ok(new
                {
                    workoutTaskId =
                        workoutTask.WorkoutTaskId,

                    exerciseName =
                        workoutTask.ExerciseName,

                    description =
                        workoutTask.Description,

                    sets =
                        workoutTask.Sets,

                    repetitions =
                        workoutTask.Repetitions,

                    workoutDate =
                        workoutTask.WorkoutDate,

                    status =
                        workoutTask.Status,

                    workoutPlanId =
                        workoutTask.WorkoutPlanId,

                    planName =
                        workoutTask.WorkoutPlan.PlanName,

                    memberId =
                        workoutTask.WorkoutPlan.GymMemberId,

                    memberName =
                        $"{workoutTask.WorkoutPlan.GymMember.Name} " +
                        $"{workoutTask.WorkoutPlan.GymMember.Surname}",

                    trainingProgramme =
                        workoutTask.WorkoutPlan
                            .TrainingProgramme
                            .ProgrammeName
                });
            }


            // GYM MEMBER
            if (User.IsInRole("GymMember"))
            {
                if (workoutTask.WorkoutPlan
                        .GymMember.ApplicationUserId !=
                    userId)
                {
                    return Forbid();
                }

                return Ok(new
                {
                    workoutTaskId =
                        workoutTask.WorkoutTaskId,

                    exerciseName =
                        workoutTask.ExerciseName,

                    description =
                        workoutTask.Description,

                    sets =
                        workoutTask.Sets,

                    repetitions =
                        workoutTask.Repetitions,

                    workoutDate =
                        workoutTask.WorkoutDate,

                    status =
                        workoutTask.Status,

                    workoutPlanId =
                        workoutTask.WorkoutPlanId,

                    planName =
                        workoutTask.WorkoutPlan.PlanName,

                    trainingProgramme =
                        workoutTask.WorkoutPlan
                            .TrainingProgramme
                            .ProgrammeName
                });
            }


            return Forbid();
        }


        // UPDATE WORKOUT TASK
        // Admin and assigned Personal Trainer
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> UpdateWorkoutTask(
            int id,
            UpdateWorkoutTaskRequest request)
        {
            if (request.Sets.HasValue &&
                request.Sets.Value <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "Sets must be greater than 0."
                });
            }

            if (request.Repetitions.HasValue &&
                request.Repetitions.Value <= 0)
            {
                return BadRequest(new
                {
                    message =
                        "Repetitions must be greater than 0."
                });
            }

            var workoutTask =
                await _context.WorkoutTasks
                    .Include(wt => wt.WorkoutPlan)
                    .ThenInclude(wp => wp.GymMember)
                    .FirstOrDefaultAsync(
                        wt => wt.WorkoutTaskId == id);

            if (workoutTask is null)
            {
                return NotFound(new
                {
                    message =
                        "Workout task does not exist."
                });
            }


            // Personal Trainer ownership check
            if (User.IsInRole("PersonalTrainer"))
            {
                var userId =
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier);

                var trainer =
                    await _context.PersonalTrainers
                        .FirstOrDefaultAsync(
                            pt => pt.ApplicationUserId ==
                                  userId);

                if (trainer is null)
                {
                    return Forbid();
                }

                if (workoutTask.WorkoutPlan
                        .GymMember.PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }
            }


            workoutTask.ExerciseName =
                request.ExerciseName ??
                workoutTask.ExerciseName;

            workoutTask.Description =
                request.Description ??
                workoutTask.Description;

            workoutTask.Sets =
                request.Sets ??
                workoutTask.Sets;

            workoutTask.Repetitions =
                request.Repetitions ??
                workoutTask.Repetitions;

            workoutTask.WorkoutDate =
                request.WorkoutDate ??
                workoutTask.WorkoutDate;


            await _context.SaveChangesAsync();


            return Ok(new
            {
                workoutTaskId =
                    workoutTask.WorkoutTaskId,

                exerciseName =
                    workoutTask.ExerciseName,

                description =
                    workoutTask.Description,

                sets =
                    workoutTask.Sets,

                repetitions =
                    workoutTask.Repetitions,

                workoutDate =
                    workoutTask.WorkoutDate,

                status =
                    workoutTask.Status,

                workoutPlanId =
                    workoutTask.WorkoutPlanId,

                message =
                    "Workout task updated successfully."
            });
        }


        // DELETE WORKOUT TASK
        // Admin and assigned Personal Trainer
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> DeleteWorkoutTask(
            int id)
        {
            var workoutTask =
                await _context.WorkoutTasks
                    .Include(wt => wt.WorkoutPlan)
                    .ThenInclude(wp => wp.GymMember)
                    .FirstOrDefaultAsync(
                        wt => wt.WorkoutTaskId == id);

            if (workoutTask is null)
            {
                return NotFound(new
                {
                    message =
                        "Workout task does not exist."
                });
            }


            // Personal Trainer ownership check
            if (User.IsInRole("PersonalTrainer"))
            {
                var userId =
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier);

                var trainer =
                    await _context.PersonalTrainers
                        .FirstOrDefaultAsync(
                            pt => pt.ApplicationUserId ==
                                  userId);

                if (trainer is null)
                {
                    return Forbid();
                }

                if (workoutTask.WorkoutPlan
                        .GymMember.PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }
            }


            _context.WorkoutTasks.Remove(workoutTask);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                    "Workout task deleted successfully."
            });
        }


        // UPDATE TASK STATUS
        // Gym Member only
        [HttpPut("{id}/status")]
        [Authorize(Roles = "GymMember")]
        public async Task<IActionResult> UpdateTaskStatus(
            int id,
            UpdateTaskStatusRequest request)
        {
            var allowedStatuses =
                new[]
                {
                    "Not Started",
                    "In Progress",
                    "Complete"
                };


            var requestedStatus =
                allowedStatuses.FirstOrDefault(
                    s => s.Equals(
                        request.Status,
                        StringComparison.OrdinalIgnoreCase));

            if (requestedStatus is null)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid status. Use Not Started, In Progress, or Complete."
                });
            }


            var workoutTask =
                await _context.WorkoutTasks
                    .Include(wt => wt.WorkoutPlan)
                    .ThenInclude(wp => wp.GymMember)
                    .FirstOrDefaultAsync(
                        wt => wt.WorkoutTaskId == id);

            if (workoutTask is null)
            {
                return NotFound(new
                {
                    message =
                        "Workout task does not exist."
                });
            }


            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            if (workoutTask.WorkoutPlan
                    .GymMember.ApplicationUserId !=
                userId)
            {
                return Forbid();
            }


            workoutTask.Status =
                requestedStatus;

            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "Workout task status updated successfully.",

                taskId =
                    workoutTask.WorkoutTaskId,

                status =
                    workoutTask.Status
            });
        }


        // GET MY WORKOUT TASKS
        // Gym Member
        [HttpGet("my")]
        [Authorize(Roles = "GymMember")]
        public async Task<IActionResult> GetMyTasks()
        {
            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

            var tasks =
                await _context.WorkoutTasks
                    .Where(wt =>
                        wt.WorkoutPlan.GymMember
                            .ApplicationUserId ==
                        userId)
                    .Select(wt => new
                    {
                        workoutTaskId =
                            wt.WorkoutTaskId,

                        exerciseName =
                            wt.ExerciseName,

                        description =
                            wt.Description,

                        sets =
                            wt.Sets,

                        repetitions =
                            wt.Repetitions,

                        workoutDate =
                            wt.WorkoutDate,

                        status =
                            wt.Status,

                        workoutPlanId =
                            wt.WorkoutPlanId,

                        planName =
                            wt.WorkoutPlan.PlanName,

                        trainingProgramme =
                            wt.WorkoutPlan
                                .TrainingProgramme
                                .ProgrammeName
                    })
                    .ToListAsync();

            return Ok(tasks);
        }


        // FILTER MY TASKS BY STATUS
        // Gym Member
        [HttpGet("my/filter")]
        [Authorize(Roles = "GymMember")]
        public async Task<IActionResult> FilterMyTasks(
            string? status)
        {
            var allowedStatuses =
                new[]
                {
                    "Not Started",
                    "In Progress",
                    "Complete"
                };


            if (string.IsNullOrWhiteSpace(status))
            {
                return BadRequest(new
                {
                    message =
                        "Please provide a status."
                });
            }


            var requestedStatus =
                allowedStatuses.FirstOrDefault(
                    s => s.Equals(
                        status,
                        StringComparison.OrdinalIgnoreCase));

            if (requestedStatus is null)
            {
                return BadRequest(new
                {
                    message =
                        "Invalid status. Use Not Started, In Progress, or Complete."
                });
            }


            var userId =
                User.FindFirstValue(
                    ClaimTypes.NameIdentifier);


            var tasks =
                await _context.WorkoutTasks
                    .Where(wt =>
                        wt.WorkoutPlan.GymMember
                            .ApplicationUserId ==
                        userId &&
                        wt.Status == requestedStatus)
                    .Select(wt => new
                    {
                        workoutTaskId =
                            wt.WorkoutTaskId,

                        exerciseName =
                            wt.ExerciseName,

                        description =
                            wt.Description,

                        sets =
                            wt.Sets,

                        repetitions =
                            wt.Repetitions,

                        workoutDate =
                            wt.WorkoutDate,

                        status =
                            wt.Status,

                        workoutPlanId =
                            wt.WorkoutPlanId,

                        planName =
                            wt.WorkoutPlan.PlanName,

                        trainingProgramme =
                            wt.WorkoutPlan
                                .TrainingProgramme
                                .ProgrammeName
                    })
                    .ToListAsync();

            return Ok(tasks);
        }


        // GET TASKS FOR A WORKOUT PLAN
        // Admin and assigned Personal Trainer
        [HttpGet("plan/{workoutPlanId}")]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> GetTasksForWorkoutPlan(
            int workoutPlanId)
        {
            var workoutPlan =
                await _context.WorkoutPlans
                    .Include(wp => wp.GymMember)
                    .FirstOrDefaultAsync(
                        wp => wp.WorkoutPlanId ==
                              workoutPlanId);

            if (workoutPlan is null)
            {
                return NotFound(new
                {
                    message =
                        "Workout plan does not exist."
                });
            }


            // Personal Trainer ownership check
            if (User.IsInRole("PersonalTrainer"))
            {
                var userId =
                    User.FindFirstValue(
                        ClaimTypes.NameIdentifier);

                var trainer =
                    await _context.PersonalTrainers
                        .FirstOrDefaultAsync(
                            pt => pt.ApplicationUserId ==
                                  userId);

                if (trainer is null)
                {
                    return Forbid();
                }

                if (workoutPlan.GymMember
                        .PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }
            }


            var tasks =
                await _context.WorkoutTasks
                    .Where(wt =>
                        wt.WorkoutPlanId ==
                        workoutPlanId)
                    .Select(wt => new
                    {
                        workoutTaskId =
                            wt.WorkoutTaskId,

                        exerciseName =
                            wt.ExerciseName,

                        description =
                            wt.Description,

                        sets =
                            wt.Sets,

                        repetitions =
                            wt.Repetitions,

                        workoutDate =
                            wt.WorkoutDate,

                        status =
                            wt.Status,

                        workoutPlanId =
                            wt.WorkoutPlanId
                    })
                    .ToListAsync();

            return Ok(tasks);
        }
    }
}
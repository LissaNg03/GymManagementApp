using GymManagementSystem.Data;
using GymManagementSystem.Models;
using GymManagementSystem.Models.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GymManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WorkoutPlansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public WorkoutPlansController(
            ApplicationDbContext context)
        {
            _context = context;
        }


        // CREATE WORKOUT PLAN
        [HttpPost]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> CreateWorkoutPlan(
            CreateWorkoutPlanRequest request)
        {
            var member = await _context.GymMembers
                .FirstOrDefaultAsync(
                    gm => gm.GymMemberId ==
                          request.GymMemberId);

            if (member is null)
            {
                return BadRequest(new
                {
                    message =
                        "The specified gym member does not exist."
                });
            }

            var programmeExists =
                await _context.TrainingProgrammes
                    .AnyAsync(tp =>
                        tp.TrainingProgrammeId ==
                        request.TrainingProgrammeId);

            if (!programmeExists)
            {
                return BadRequest(new
                {
                    message =
                        "The specified training programme does not exist."
                });
            }


            // Personal Trainer ownership check
            if (User.IsInRole("PersonalTrainer"))
            {
                var userId = User.FindFirstValue(
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

                if (member.PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }
            }


            var workoutPlan = new WorkoutPlan
            {
                PlanName =
                    request.PlanName,

                Description =
                    request.Description,

                GymMemberId =
                    request.GymMemberId,

                TrainingProgrammeId =
                    request.TrainingProgrammeId
            };

            _context.WorkoutPlans.Add(workoutPlan);

            await _context.SaveChangesAsync();


            return CreatedAtAction(
                nameof(GetWorkoutPlan),
                new
                {
                    id = workoutPlan.WorkoutPlanId
                },
                new
                {
                    workoutPlanId =
                        workoutPlan.WorkoutPlanId,

                    planName =
                        workoutPlan.PlanName,

                    description =
                        workoutPlan.Description,

                    gymMemberId =
                        workoutPlan.GymMemberId,

                    trainingProgrammeId =
                        workoutPlan.TrainingProgrammeId,

                    message =
                        "Workout plan created successfully."
                }
            );
        }


        // GET ALL WORKOUT PLANS
        [HttpGet]
        public async Task<IActionResult> GetWorkoutPlans()
        {
            var workoutPlans =
                await _context.WorkoutPlans
                    .Select(wp => new
                    {
                        workoutPlanId =
                            wp.WorkoutPlanId,

                        planName =
                            wp.PlanName,

                        description =
                            wp.Description,

                        gymMemberId =
                            wp.GymMemberId,

                        memberName =
                            wp.GymMember.Name,

                        memberSurname =
                            wp.GymMember.Surname,

                        memberNumber =
                            wp.GymMember.MemberNumber,

                        trainingProgrammeId =
                            wp.TrainingProgrammeId,

                        trainingProgramme =
                            wp.TrainingProgramme.ProgrammeName
                    })
                    .ToListAsync();

            return Ok(workoutPlans);
        }


        // GET WORKOUT PLAN BY ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorkoutPlan(
            int id)
        {
            var workoutPlan =
                await _context.WorkoutPlans
                    .Where(wp =>
                        wp.WorkoutPlanId == id)
                    .Select(wp => new
                    {
                        workoutPlanId =
                            wp.WorkoutPlanId,

                        planName =
                            wp.PlanName,

                        description =
                            wp.Description,

                        gymMemberId =
                            wp.GymMemberId,

                        memberNumber =
                            wp.GymMember.MemberNumber,

                        memberName =
                            wp.GymMember.Name,

                        memberSurname =
                            wp.GymMember.Surname,

                        trainingProgrammeId =
                            wp.TrainingProgrammeId,

                        trainingProgramme =
                            wp.TrainingProgramme.ProgrammeName,

                        duration =
                            wp.TrainingProgramme.Duration,

                        fitnessGoal =
                            wp.TrainingProgramme.FitnessGoal
                    })
                    .FirstOrDefaultAsync();

            if (workoutPlan is null)
            {
                return NotFound(new
                {
                    message =
                        "Workout plan does not exist."
                });
            }

            return Ok(workoutPlan);
        }


        // UPDATE WORKOUT PLAN
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> UpdateWorkoutPlan(
            int id,
            UpdateWorkoutPlanRequest request)
        {
            var workoutPlan =
                await _context.WorkoutPlans
                    .Include(wp => wp.GymMember)
                    .FirstOrDefaultAsync(
                        wp => wp.WorkoutPlanId == id);

            if (workoutPlan is null)
            {
                return NotFound(new
                {
                    message =
                        "Workout plan does not exist."
                });
            }


            // Get trainer once if the caller is a trainer
            PersonalTrainer? trainer = null;

            if (User.IsInRole("PersonalTrainer"))
            {
                var userId = User.FindFirstValue(
                    ClaimTypes.NameIdentifier);

                trainer =
                    await _context.PersonalTrainers
                        .FirstOrDefaultAsync(
                            pt => pt.ApplicationUserId ==
                                  userId);

                if (trainer is null)
                {
                    return Forbid();
                }


                // Make sure the existing plan belongs
                // to one of this trainer's members.
                if (workoutPlan.GymMember
                        .PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }
            }


            // Validate new member if supplied
            GymMember? newMember = null;

            if (request.GymMemberId.HasValue)
            {
                newMember =
                    await _context.GymMembers
                        .FirstOrDefaultAsync(
                            gm => gm.GymMemberId ==
                                  request.GymMemberId.Value);

                if (newMember is null)
                {
                    return BadRequest(new
                    {
                        message =
                            "The specified gym member does not exist."
                    });
                }


                // Trainer may only move a plan
                // to one of their own members.
                if (trainer is not null &&
                    newMember.PersonalTrainerId !=
                    trainer.PersonalTrainerId)
                {
                    return Forbid();
                }
            }


            // Validate training programme
            if (request.TrainingProgrammeId.HasValue)
            {
                var programmeExists =
                    await _context.TrainingProgrammes
                        .AnyAsync(tp =>
                            tp.TrainingProgrammeId ==
                            request.TrainingProgrammeId.Value);

                if (!programmeExists)
                {
                    return BadRequest(new
                    {
                        message =
                            "The specified training programme does not exist."
                    });
                }
            }


            workoutPlan.PlanName =
                request.PlanName ??
                workoutPlan.PlanName;

            workoutPlan.Description =
                request.Description ??
                workoutPlan.Description;

            workoutPlan.GymMemberId =
                request.GymMemberId ??
                workoutPlan.GymMemberId;

            workoutPlan.TrainingProgrammeId =
                request.TrainingProgrammeId ??
                workoutPlan.TrainingProgrammeId;


            await _context.SaveChangesAsync();


            return Ok(new
            {
                workoutPlanId =
                    workoutPlan.WorkoutPlanId,

                planName =
                    workoutPlan.PlanName,

                description =
                    workoutPlan.Description,

                gymMemberId =
                    workoutPlan.GymMemberId,

                trainingProgrammeId =
                    workoutPlan.TrainingProgrammeId,

                message =
                    "Workout plan updated successfully."
            });
        }


        // DELETE WORKOUT PLAN
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,PersonalTrainer")]
        public async Task<IActionResult> DeleteWorkoutPlan(
            int id)
        {
            var workoutPlan =
                await _context.WorkoutPlans
                    .Include(wp => wp.GymMember)
                    .FirstOrDefaultAsync(
                        wp => wp.WorkoutPlanId == id);

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
                var userId = User.FindFirstValue(
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


            // WorkoutTasks will be deleted through
            // cascade delete.
            _context.WorkoutPlans.Remove(workoutPlan);

            await _context.SaveChangesAsync();


            return Ok(new
            {
                message =
                    "Workout plan deleted successfully."
            });
        }
    }
}
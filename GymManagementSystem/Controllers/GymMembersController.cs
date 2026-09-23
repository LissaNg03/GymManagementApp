using GymManagementSystem.Data;
using GymManagementSystem.Models;
using GymManagementSystem.Models.DTOs;
using GymManagementSystem.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
namespace GymManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GymMembersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly NumberGeneratorService _numberGenerator;
        private readonly UserManager<ApplicationUser> _userManager;
        public GymMembersController(
                ApplicationDbContext context,
                NumberGeneratorService numberGenerator,
                UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _numberGenerator = numberGenerator;
            _userManager = userManager;
        }

        // GET: api/GymMembers
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMembers()
        {
            var members = await _context.GymMembers
                .Select(gm => new
                {
                    gymMemberId = gm.GymMemberId,
                    memberNumber = gm.MemberNumber,
                    name = gm.Name,
                    surname = gm.Surname,
                    gender = gm.Gender,
                    dateOfBirth = gm.DateOfBirth,
                    homeAddress = gm.HomeAddress,
                    email = gm.Email,
                    phoneNumber = gm.PhoneNumber,
                    membershipType = gm.MembershipType,
                    personalTrainerId = gm.PersonalTrainerId
                })
                .ToListAsync();

            return Ok(members);
        }

        //GET ONE MEMBER BY ID
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetMemberById(int id)
        {
            var member = await _context.GymMembers
                .Where(gm =>
                    gm.GymMemberId == id)
                .Select(gm => new
                {
                    gymMemberId = gm.GymMemberId,
                    memberNumber = gm.MemberNumber,
                    name = gm.Name,
                    surname = gm.Surname,
                    gender = gm.Gender,
                    dateOfBirth = gm.DateOfBirth,
                    homeAddress = gm.HomeAddress,
                    email = gm.Email,
                    phoneNumber = gm.PhoneNumber,
                    membershipType = gm.MembershipType,
                    personalTrainerId = gm.PersonalTrainerId
                })
                .FirstOrDefaultAsync();

            if (member is null)
            {
                return NotFound(new
                {
                    message = "Gym member not found."
                });
            }

            return Ok(member);
        }

        //ADD GYM MEMBER, ONLY BY ADMIN
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddMember(
    CreateGymMemberRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(
                request.Email);

            if (existingUser is not null)
            {
                return BadRequest(new
                {
                    message =
                        "A user with this email already exists."
                });
            }

            var trainerExists = await _context.PersonalTrainers
                .AnyAsync(t =>
                    t.PersonalTrainerId ==
                    request.PersonalTrainerId);

            if (!trainerExists)
            {
                return BadRequest(new
                {
                    message =
                        "The specified personal trainer does not exist."
                });
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // Generate unique member number
                string memberNumber;

                do
                {
                    memberNumber =
                        _numberGenerator.Generate("GM");
                }
                while (await _context.GymMembers
                    .AnyAsync(m =>
                        m.MemberNumber == memberNumber));

                // Create Identity account
                var user = new ApplicationUser
                {
                    UserName = request.Email,
                    Email = request.Email,
                    Name = request.Name,
                    Surname = request.Surname
                };

                var result = await _userManager.CreateAsync(
                    user,
                    request.Password);

                if (!result.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message =
                            "Could not create gym member account.",
                        errors =
                            result.Errors.Select(
                                e => e.Description)
                    });
                }

                // Assign GymMember role
                var roleResult = await _userManager.AddToRoleAsync(
                    user,
                    "GymMember");

                if (!roleResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message =
                            "Could not assign GymMember role.",
                        errors =
                            roleResult.Errors.Select(
                                e => e.Description)
                    });
                }

                // Create GymMember profile
                var member = new GymMember
                {
                    ApplicationUserId = user.Id,

                    MemberNumber = memberNumber,

                    Name = request.Name,
                    Surname = request.Surname,
                    Gender = request.Gender,
                    DateOfBirth = request.DateOfBirth,
                    HomeAddress = request.HomeAddress,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    MembershipType = request.MembershipType,

                    PersonalTrainerId =
                        request.PersonalTrainerId
                };

                _context.GymMembers.Add(member);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(
                    nameof(GetMemberById),
                    new { id = member.GymMemberId },
                    new
                    {
                        gymMemberId =
                            member.GymMemberId,

                        memberNumber =
                            member.MemberNumber,

                        name =
                            member.Name,

                        surname =
                            member.Surname,

                        gender =
                            member.Gender,

                        dateOfBirth =
                            member.DateOfBirth,

                        homeAddress =
                            member.HomeAddress,

                        email =
                            member.Email,

                        phoneNumber =
                            member.PhoneNumber,

                        membershipType =
                            member.MembershipType,

                        personalTrainerId =
                            member.PersonalTrainerId,

                        message =
                            "Gym member account created successfully."
                    }
                );
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message =
                        "An error occurred while creating the gym member."
                });
            }
        }

        //UPDATE A GYM MEMBER, CAN'T UPDATE MEMBERNUMBER AND ID
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateMember(
    int id,
    UpdateGymMemberRequest request)
        {
            var member = await _context.GymMembers
                .FirstOrDefaultAsync(m =>
                    m.GymMemberId == id);

            if (member is null)
            {
                return NotFound(new
                {
                    message =
                        "Gym member does not exist."
                });
            }

            var user = await _userManager.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == member.ApplicationUserId);

            if (user is null)
            {
                return NotFound(new
                {
                    message =
                        "The Identity account for this gym member does not exist."
                });
            }

            // Check email uniqueness if email is changing
            if (!string.IsNullOrWhiteSpace(request.Email) &&
                request.Email != member.Email)
            {
                var existingUser =
                    await _userManager.FindByEmailAsync(
                        request.Email);

                if (existingUser is not null &&
                    existingUser.Id != user.Id)
                {
                    return BadRequest(new
                    {
                        message =
                            "A user with this email already exists."
                    });
                }
            }

            // Validate trainer if one is supplied
            if (request.PersonalTrainerId.HasValue)
            {
                var trainerExists =
                    await _context.PersonalTrainers
                        .AnyAsync(pt =>
                            pt.PersonalTrainerId ==
                            request.PersonalTrainerId.Value);

                if (!trainerExists)
                {
                    return BadRequest(new
                    {
                        message =
                            "The specified personal trainer does not exist."
                    });
                }
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                member.Name =
                    request.Name ?? member.Name;

                member.Surname =
                    request.Surname ?? member.Surname;

                member.Gender =
                    request.Gender ?? member.Gender;

                member.DateOfBirth =
                    request.DateOfBirth ?? member.DateOfBirth;

                member.HomeAddress =
                    request.HomeAddress ?? member.HomeAddress;

                member.Email =
                    request.Email ?? member.Email;

                member.PhoneNumber =
                    request.PhoneNumber ?? member.PhoneNumber;

                member.MembershipType =
                    request.MembershipType ??
                    member.MembershipType;

                member.PersonalTrainerId =
                    request.PersonalTrainerId ??
                    member.PersonalTrainerId;

                // Keep Identity synchronized
                user.Name = member.Name;
                user.Surname = member.Surname;
                user.Email = member.Email;
                user.UserName = member.Email;

                var identityResult =
                    await _userManager.UpdateAsync(user);

                if (!identityResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message =
                            "Could not update the gym member Identity account.",
                        errors =
                            identityResult.Errors.Select(
                                e => e.Description)
                    });
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    gymMemberId =
                        member.GymMemberId,

                    memberNumber =
                        member.MemberNumber,

                    name =
                        member.Name,

                    surname =
                        member.Surname,

                    gender =
                        member.Gender,

                    dateOfBirth =
                        member.DateOfBirth,

                    homeAddress =
                        member.HomeAddress,

                    email =
                        member.Email,

                    phoneNumber =
                        member.PhoneNumber,

                    membershipType =
                        member.MembershipType,

                    personalTrainerId =
                        member.PersonalTrainerId,

                    message =
                        "Gym member updated successfully."
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message =
                        "An error occurred while updating the gym member."
                });
            }
        }

        // ASSIGN PERSONAL TRAINER TO MEMBER
        [HttpPut("{id}/trainer")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTrainer(
            int id,
            AssignTrainerRequest request)
        {
            var member = await _context.GymMembers
                .FirstOrDefaultAsync(m => m.GymMemberId == id);

            if (member is null)
            {
                return NotFound(new
                {
                    message = "Gym member does not exist."
                });
            }

            var trainer = await _context.PersonalTrainers
                .FirstOrDefaultAsync(pt =>
                    pt.PersonalTrainerId == request.PersonalTrainerId);

            if (trainer is null)
            {
                return BadRequest(new
                {
                    message = "The specified personal trainer does not exist."
                });
            }

            member.PersonalTrainerId = trainer.PersonalTrainerId;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message =
                "Personal trainer assigned successfully.",

                        memberId =
                member.GymMemberId,

                        memberName =
                $"{member.Name} {member.Surname}",

                        trainerId =
                trainer.PersonalTrainerId,

                        trainerName =
                $"{trainer.Name} {trainer.Surname}"
                    });
        }

        //GET MEMBER PROFILE
        [HttpGet("my")]
        [Authorize(Roles = "GymMember")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var member = await _context.GymMembers
                .FirstOrDefaultAsync(
                    gm => gm.ApplicationUserId == userId);

            if (member is null)
            {
                return NotFound(new
                {
                    message = "Gym member profile does not exist."
                });
            }

            return Ok(new
            {
                member.GymMemberId,
                member.MemberNumber,
                member.Name,
                member.Surname,
                member.Gender,
                member.DateOfBirth,
                member.HomeAddress,
                member.Email,
                member.PhoneNumber,
                member.MembershipType,
                member.PersonalTrainerId
            });
        }
        
        //GET GYM MEMBER USERS
        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetGymMemberUsers()
        {
            var members = await _context.GymMembers
                .Select(gm => new
                {
                    gymMemberId = gm.GymMemberId,
                    memberNumber = gm.MemberNumber,
                    name = gm.Name,
                    surname = gm.Surname,
                    gender = gm.Gender,
                    dateOfBirth = gm.DateOfBirth,
                    homeAddress = gm.HomeAddress,
                    email = gm.Email,
                    phoneNumber = gm.PhoneNumber,
                    membershipType = gm.MembershipType,
                    personalTrainerId = gm.PersonalTrainerId
                })
                .ToListAsync();

            return Ok(members);
        }

        //GET MEMBER WORKOUT PLANS
        [HttpGet("my/workout-plans")]
        [Authorize(Roles = "GymMember")]
        public async Task<IActionResult> GetMyWorkoutPlans()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var plans = await _context.WorkoutPlans
                .Where(wp =>
                    wp.GymMember.ApplicationUserId == userId)
                .Select(wp => new
                {
                    workoutPlanId = wp.WorkoutPlanId,
                    planName = wp.PlanName,
                    description = wp.Description,
                    trainingProgrammeId = wp.TrainingProgrammeId,
                    trainingProgramme =
                        wp.TrainingProgramme.ProgrammeName,
                    duration =
                        wp.TrainingProgramme.Duration,
                    fitnessGoal =
                        wp.TrainingProgramme.FitnessGoal
                })
                .ToListAsync();

            return Ok(plans);
        }

        //ASSIGNING TRAINING PROGRAMMES
        [HttpPost("{id}/training-programme")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignTrainingProgramme(
    int id,
    AssignTrainingProgrammeRequest request)
        {
            // Find the gym member
            var member = await _context.GymMembers
                .FirstOrDefaultAsync(
                    gm => gm.GymMemberId == id);

            if (member is null)
            {
                return NotFound(new
                {
                    message = "Gym member does not exist."
                });
            }

            // Find the training programme
            var programme = await _context.TrainingProgrammes
                .FirstOrDefaultAsync(
                    tp => tp.TrainingProgrammeId ==
                          request.TrainingProgrammeId);

            if (programme is null)
            {
                return BadRequest(new
                {
                    message = "The specified training programme does not exist."
                });
            }

            // Create the workout plan.
            // This connects the member to the programme.
            var workoutPlan = new WorkoutPlan
            {
                PlanName = request.PlanName,
                Description = request.Description,
                GymMemberId = member.GymMemberId,
                TrainingProgrammeId =
                    programme.TrainingProgrammeId
            };

            _context.WorkoutPlans.Add(workoutPlan);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(AssignTrainingProgramme),
                new { id = member.GymMemberId },
                new
                {
                    workoutPlanId = workoutPlan.WorkoutPlanId,
                    gymMemberId = member.GymMemberId,
                    memberName =
                        $"{member.Name} {member.Surname}",
                    trainingProgrammeId =
                        programme.TrainingProgrammeId,
                    trainingProgramme =
                        programme.ProgrammeName,
                    planName = workoutPlan.PlanName,
                    description = workoutPlan.Description,
                    message =
                        "Training programme assigned successfully."
                }
            );
        }

        //GET RELATED TRAINING PROGRAMMES
        [HttpGet("my/training-programmes")]
        [Authorize(Roles = "GymMember")]
        public async Task<IActionResult> GetMyTrainingProgrammes()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var programmes = await _context.WorkoutPlans
                .Where(wp =>
                    wp.GymMember.ApplicationUserId == userId)
                .Select(wp => new
                {
                    trainingProgrammeId =
                        wp.TrainingProgrammeId,

                    programmeName =
                        wp.TrainingProgramme.ProgrammeName,

                    description =
                        wp.TrainingProgramme.Description,

                    duration =
                        wp.TrainingProgramme.Duration,

                    fitnessGoal =
                        wp.TrainingProgramme.FitnessGoal
                })
                .Distinct()
                .ToListAsync();

            return Ok(programmes);
        }

        //DELETE GYM MEMBER, WITH ITS WORKOUT PLANS, AND WORKOUT TASKS
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteMember(int id)
        {
            var member = await _context.GymMembers
                .FirstOrDefaultAsync(m =>
                    m.GymMemberId == id);

            if (member is null)
            {
                return NotFound(new
                {
                    message =
                        "Gym member does not exist."
                });
            }

            var user = await _userManager.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == member.ApplicationUserId);

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // Delete GymMember.
                // WorkoutPlans and WorkoutTasks will cascade.
                _context.GymMembers.Remove(member);

                await _context.SaveChangesAsync();

                // Delete Identity account
                if (user is not null)
                {
                    var identityResult =
                        await _userManager.DeleteAsync(user);

                    if (!identityResult.Succeeded)
                    {
                        await transaction.RollbackAsync();

                        return BadRequest(new
                        {
                            message =
                                "Could not delete the gym member Identity account.",
                            errors =
                                identityResult.Errors.Select(
                                    e => e.Description)
                        });
                    }
                }

                await transaction.CommitAsync();

                return Ok(new
                {
                    message =
                        "Gym member and associated account deleted successfully."
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message =
                        "An error occurred while deleting the gym member."
                });
            }
        }

        // SEARCH MEMBERS
        [HttpGet("search")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SearchMembers(
      string? search)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return BadRequest(new
                {
                    message =
                        "Please provide a search term."
                });
            }

            var members = await _context.GymMembers
                .Where(m =>
                    m.MemberNumber.Contains(search) ||
                    m.Name.Contains(search) ||
                    m.Surname.Contains(search))
                .Select(m => new
                {
                    gymMemberId =
                        m.GymMemberId,

                    memberNumber =
                        m.MemberNumber,

                    name =
                        m.Name,

                    surname =
                        m.Surname,

                    gender =
                        m.Gender,

                    dateOfBirth =
                        m.DateOfBirth,

                    homeAddress =
                        m.HomeAddress,

                    email =
                        m.Email,

                    phoneNumber =
                        m.PhoneNumber,

                    membershipType =
                        m.MembershipType,

                    personalTrainerId =
                        m.PersonalTrainerId
                })
                .ToListAsync();

            return Ok(members);
        }


    }
}
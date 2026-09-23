using GymManagementSystem.Data;
using GymManagementSystem.Models;
using GymManagementSystem.Models.DTOs;
using GymManagementSystem.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PersonalTrainersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly NumberGeneratorService _numberGenerator;
        private readonly UserManager<ApplicationUser> _userManager;

        public PersonalTrainersController(
            ApplicationDbContext context,
            NumberGeneratorService numberGenerator,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _numberGenerator = numberGenerator;
            _userManager = userManager;
        }
        // ADD TRAINER
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddTrainer(
        CreatePersonalTrainerRequest request)
        {
            var existingUser = await _userManager.FindByEmailAsync(
                request.Email);

            if (existingUser is not null)
            {
                return BadRequest(new
                {
                    message = "A user with this email already exists."
                });
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                // Generate unique staff number
                string staffNumber;

                do
                {
                    staffNumber =
                        _numberGenerator.Generate("ST");
                }
                while (await _context.PersonalTrainers
                    .AnyAsync(pt =>
                        pt.StaffNumber == staffNumber));

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
                        message = "Could not create trainer account.",
                        errors = result.Errors.Select(
                            e => e.Description)
                    });
                }

                // Assign PersonalTrainer role
                var roleResult = await _userManager.AddToRoleAsync(
                    user,
                    "PersonalTrainer");

                if (!roleResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message = "Could not assign PersonalTrainer role.",
                        errors = roleResult.Errors.Select(
                            e => e.Description)
                    });
                }

                // Create PersonalTrainer profile
                var trainer = new PersonalTrainer
                {
                    ApplicationUserId = user.Id,
                    StaffNumber = staffNumber,
                    Name = request.Name,
                    Surname = request.Surname,
                    Gender = request.Gender,
                    Email = request.Email,
                    PhoneNumber = request.PhoneNumber,
                    Specialization = request.Specialization
                };

                _context.PersonalTrainers.Add(trainer);

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return CreatedAtAction(
                    nameof(GetTrainer),
                    new { id = trainer.PersonalTrainerId },
                    new
                    {
                        personalTrainerId =
                            trainer.PersonalTrainerId,

                        staffNumber =
                            trainer.StaffNumber,

                        name =
                            trainer.Name,

                        surname =
                            trainer.Surname,

                        gender =
                            trainer.Gender,

                        email =
                            trainer.Email,

                        phoneNumber =
                            trainer.PhoneNumber,

                        specialization =
                            trainer.Specialization,

                        message =
                            "Personal trainer account created successfully."
                    }
                );
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message =
                        "An error occurred while creating the personal trainer."
                });
            }
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPersonalTrainerUsers()
        {
            var trainers = await _context.PersonalTrainers
                .Select(pt => new
                {
                    personalTrainerId = pt.PersonalTrainerId,
                    staffNumber = pt.StaffNumber,
                    name = pt.Name,
                    surname = pt.Surname,
                    gender = pt.Gender,
                    email = pt.Email,
                    phoneNumber = pt.PhoneNumber,
                    specialization = pt.Specialization
                })
                .ToListAsync();

            return Ok(trainers);
        }

        //PERSONAL TRAINER TRAINING PROGRAMMES.
        [HttpGet("my/training-programmes")]
        [Authorize(Roles = "PersonalTrainer")]
        public async Task<IActionResult> GetMyTrainingProgrammes()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var trainer = await _context.PersonalTrainers
                .FirstOrDefaultAsync(
                    pt => pt.ApplicationUserId == userId);

            if (trainer is null)
                return Forbid();

            var programmes = await _context.WorkoutPlans
                .Where(wp =>
                    wp.GymMember.PersonalTrainerId
                    == trainer.PersonalTrainerId)
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

        //GET PERSONAL TRAINER ASSIGNED MEMBERS
        [HttpGet("my/members")]
        [Authorize(Roles = "PersonalTrainer")]
        public async Task<IActionResult> GetMyMembers()
        {
            var userId = User.FindFirstValue(
                ClaimTypes.NameIdentifier);

            var trainer = await _context.PersonalTrainers
                .FirstOrDefaultAsync(
                    pt => pt.ApplicationUserId == userId);

            if (trainer is null)
                return Forbid();

            var members = await _context.GymMembers
                .Where(gm =>
                    gm.PersonalTrainerId == trainer.PersonalTrainerId)
                .Select(gm => new
                {
                    gymMemberId = gm.GymMemberId,
                    memberNumber = gm.MemberNumber,
                    name = gm.Name,
                    surname = gm.Surname,
                    gender = gm.Gender,
                    email = gm.Email,
                    phoneNumber = gm.PhoneNumber,
                    membershipType = gm.MembershipType
                })
                .ToListAsync();

            return Ok(members);
        }

        // GET ALL TRAINERS
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTrainers()
        {
            var trainers = await _context.PersonalTrainers
                .Select(pt => new
                {
                    personalTrainerId = pt.PersonalTrainerId,
                    staffNumber = pt.StaffNumber,
                    name = pt.Name,
                    surname = pt.Surname,
                    gender = pt.Gender,
                    email = pt.Email,
                    phoneNumber = pt.PhoneNumber,
                    specialization = pt.Specialization
                })
                .ToListAsync();

            return Ok(trainers);
        }

        // GET TRAINER BY ID
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTrainer(int id)
        {
            var trainer = await _context.PersonalTrainers
                .Where(pt => pt.PersonalTrainerId == id)
                .Select(pt => new
                {
                    personalTrainerId = pt.PersonalTrainerId,
                    staffNumber = pt.StaffNumber,
                    name = pt.Name,
                    surname = pt.Surname,
                    gender = pt.Gender,
                    email = pt.Email,
                    phoneNumber = pt.PhoneNumber,
                    specialization = pt.Specialization
                })
                .FirstOrDefaultAsync();

            if (trainer is null)
            {
                return NotFound(new
                {
                    message = "Personal trainer does not exist."
                });
            }

            return Ok(trainer);
        }


        // UPDATE TRAINER
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTrainer(
          int id,
          UpdatePersonalTrainerRequest request)
        {
            var trainer = await _context.PersonalTrainers
                .FirstOrDefaultAsync(pt =>
                    pt.PersonalTrainerId == id);

            if (trainer is null)
            {
                return NotFound(new
                {
                    message =
                        "Personal trainer does not exist."
                });
            }

            var user = await _userManager.Users
                .FirstOrDefaultAsync(u =>
                    u.Id == trainer.ApplicationUserId);

            if (user is null)
            {
                return NotFound(new
                {
                    message =
                        "The Identity account for this trainer does not exist."
                });
            }

            if (!string.IsNullOrWhiteSpace(request.Email) &&
                request.Email != trainer.Email)
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

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                trainer.Name =
                    request.Name ?? trainer.Name;

                trainer.Surname =
                    request.Surname ?? trainer.Surname;

                trainer.Gender =
                    request.Gender ?? trainer.Gender;

                trainer.Email =
                    request.Email ?? trainer.Email;

                trainer.PhoneNumber =
                    request.PhoneNumber ?? trainer.PhoneNumber;

                trainer.Specialization =
                    request.Specialization ??
                    trainer.Specialization;

                // Synchronize Identity account
                user.Name = trainer.Name;
                user.Surname = trainer.Surname;
                user.Email = trainer.Email;
                user.UserName = trainer.Email;

                var identityResult =
                    await _userManager.UpdateAsync(user);

                if (!identityResult.Succeeded)
                {
                    await transaction.RollbackAsync();

                    return BadRequest(new
                    {
                        message =
                            "Could not update trainer Identity account.",
                        errors =
                            identityResult.Errors.Select(
                                e => e.Description)
                    });
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return Ok(new
                {
                    personalTrainerId =
                        trainer.PersonalTrainerId,

                    staffNumber =
                        trainer.StaffNumber,

                    name =
                        trainer.Name,

                    surname =
                        trainer.Surname,

                    gender =
                        trainer.Gender,

                    email =
                        trainer.Email,

                    phoneNumber =
                        trainer.PhoneNumber,

                    specialization =
                        trainer.Specialization,

                    message =
                        "Personal trainer updated successfully."
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message =
                        "An error occurred while updating the personal trainer."
                });
            }
        }


        // DELETE TRAINER
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTrainer(int id)
        {
            var trainer = await _context.PersonalTrainers
                .FirstOrDefaultAsync(pt =>
                    pt.PersonalTrainerId == id);

            if (trainer is null)
            {
                return NotFound(new
                {
                    message =
                        "Personal trainer does not exist."
                });
            }

            var hasMembers = await _context.GymMembers
                .AnyAsync(gm =>
                    gm.PersonalTrainerId == id);

            if (hasMembers)
            {
                return Conflict(new
                {
                    message =
                        "This personal trainer cannot be deleted because gym members are still assigned to them."
                });
            }

            await using var transaction =
                await _context.Database.BeginTransactionAsync();

            try
            {
                var user = await _userManager.Users
                    .FirstOrDefaultAsync(u =>
                        u.Id == trainer.ApplicationUserId);

                _context.PersonalTrainers.Remove(trainer);

                await _context.SaveChangesAsync();

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
                                "Could not delete the trainer Identity account.",
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
                        "Personal trainer deleted successfully."
                });
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();

                return StatusCode(500, new
                {
                    message =
                        "An error occurred while deleting the personal trainer."
                });
            }
        }


        // SEARCH TRAINERS
        [HttpGet("search")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> SearchTrainers(
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

            var trainers = await _context.PersonalTrainers
                .Where(pt =>
                    pt.StaffNumber.Contains(search) ||
                    pt.Name.Contains(search) ||
                    pt.Surname.Contains(search))
                .Select(pt => new
                {
                    personalTrainerId =
                        pt.PersonalTrainerId,

                    staffNumber =
                        pt.StaffNumber,

                    name =
                        pt.Name,

                    surname =
                        pt.Surname,

                    gender =
                        pt.Gender,

                    email =
                        pt.Email,

                    phoneNumber =
                        pt.PhoneNumber,

                    specialization =
                        pt.Specialization
                })
                .ToListAsync();

            return Ok(trainers);
        }
    }
}
GYM MANAGEMENT SYSTEM:

BUSINESS RULES FOR THESE ENTITIES:
---------------------------------
1. PersonalTrainer → GymMember

	A Personal Trainer can be assigned to many Gym Members, while each Gym Member is assigned to one Personal 	Trainer.

2. TrainingProgramme → WorkoutPlan

	A Training Programme can contain many Workout Plans, while each Workout Plan belongs to one Training Programme.

3. GymMember → WorkoutPlan

	A Gym Member can have many Workout Plans, while each Workout Plan is assigned to one Gym Member.

4. WorkoutPlan → WorkoutTask

	A Workout Plan can contain many Workout Tasks, while each Workout Task belongs to one Workout Plan.



SUMMARY:
--------
A GYM MEMBER SIGNS UP, THEY ARE ASSIGNED A PERSONAL TRAINER.

THEY CHOOSE A WORKOUT PLAN, THEY CAN ADD MULTIPLE WORKOUT PLANS, E.G MONDAY WORKOUT, WEDNESDAY WORKOUT, ETC.

EACH WORKOUT PLAN BELONGS TO A TRAINING PROGRAMME THAT SHOWS DURATION, FITNESS GOAL, ETC. 
SO A WORKOUT PLAN IS CATEGORIZED BY A TRAINING PROGRAMME.

IN YOUR WORKOUT PLANS, YOU ADD WORKOUT TASKS, BASICALLY YOUR EXERCISES.
YOUR WORKOUT PLAN HAS  ONE GYM MEMBER THAT IT BELONGS TO, WHICH IS YOU, AND A TRAINING PROGRAMME YOU CHOSE THAT IT BELONGS TO.

*DEVELOPMENT WORKFLOW*
---------------------
1. DEFINE AND PRESENT THE BUSINESS RULES, ENTITIES AND THEIR RELATIONSHIPS;

2. CREATE THE ENTITIES AS C# CLASSES, WITH APPROPRIATE PROPS ALSO DEFINING THE NAVIGATION PROPERTIES, AND FOREIGN KEYS, AND REQUIRED FLAGS;

3. CREATE THE ApplicationDbContext TO ENABLE SQL SERVER CONNECTION, THEREFORE YOU MUST INSTALL THE ENTITY FRAMEWORK;
>Install-Package Microsoft.EntityFrameworkCore -Version 8.0.20
>Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 8.0.20
>Install-Package Microsoft.EntityFrameworkCore.Tools -Version 8.0.20

4.AFTER INSTALLING THE PACKAGES, CREATE THE APPDBCONTEXT, AND ADD YOUR ENTITIES THERE, SO THEY CAN BE CREATED IN THE DB ON MIGRATION;

5. MIGRATE: >Add-Migration InitialCreate
1.          >Update-Database
1.NOW DB IS CREATED...

6. IMPLEMENT ASP.NET IDENTITY: (RESPONSIBLE FOR AUTHENTICATING AND AUTHORIZING USERS): USER ROLES ARE: ADMIN, TRAINER, GYM MEMBER;
1. STEP 1 — Install the Identity packages
1. >Install-Package Microsoft.AspNetCore.Identity.EntityFrameworkCore
1. >Install-Package  Microsoft.AspNetCore.Authentication.JwtBearer
1. ASP.NET IDENTITY, PROVIDES An IdentityUser class, that authenticates a user, with built-in properties and password hashing...you can use that default IdentityUser class, but for custom features you create your own class preferrably ApplicationUser.cs which inherits from IdentityUser, then you add additional functionalities.
1. THEN CHANGE YOUR DBCONTEXT, NOW IT MUST INHERIT FROM IdentityDbContext<ApplicationUser>....using  
>using GymManagementSystem.Models;
>using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
>using Microsoft.EntityFrameworkCore;
1.
1.AFTER CHANGING YOUR DBCONTEXT, YOU MUST INITIALIZE NEW MIGRATION TO INCLUDE THE IDENTITY TABLES CREATED BY ASP.NET IDENTITY, EF WILL COMPARE THE EXISITNG MIGRATION OF THE PRIMITIVE TABLES, AND UPDATE THE MIGRATION, THEN AFTER THAT, YOU UPDATE-DATABASE::
>Your C# Models
      ↓
ApplicationDbContext
      ↓
EF Core Migration
      ↓
SQL Server
      ↓
GymManagementSystem

Then we extended the model:

ApplicationUser : IdentityUser
      ↓
IdentityDbContext<ApplicationUser>
      ↓
AddIdentity migration
      ↓
SQL Server
      ↓
AspNetUsers / AspNetRoles / etc.

7.SO FAR I'VE JUST CREATED THE ROLE BASED IDENTITY INFRASTRUCTED BUT HAVE NOT IMPLEMENTED IT IN CODE:

We're going to create these three roles:
Admin
PersonalTrainer
GymMember

Admin
 ├── Manage employees
 ├── Manage gym members
 └── Manage trainers

PersonalTrainer
 ├── View assigned members
 └── Manage training information

GymMember
 ├─- View own profile
 └── View own membership information

 8. CREATE AN AuthController:
 1. using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using GymManagementSystem.Models;
namespace GymManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public AuthController(UserManager userManager)
        {
            _userManager = userManager;
        }
    }
}

 9. CREATING LOGIN DTO
 1. 


















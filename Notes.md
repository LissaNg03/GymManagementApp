


#USING ASP.NET TO CREATE WEB RESTful APIs (CRUD):
#MODEL-VIEW-CONTROLLER CODE-FIRST APPROACH WITH SQL SERVER

 public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {

        }
DbContext = Parent class supplied by Entity Framework Core.
ApplicationDbContext = Your application's custom database context.
DbContextOptions = Stores database configuration.
options = Variable containing those settings.
base(options) = Passes the configuration to the parent DbContext.
DbSet<T> = Represents a database table.
ApplicationDbContext acts as the main gateway between your application and the database.

#BASICALLY CREATING YOUR DATABASE USING LINQ TECHNIQUES, THIS WILL ALLOW YOU TO QUERY THE DB USING LINQ(LANGUAGE INTEGRATED QUERRIES) I.E USING NORMAL C# OOP:

>public DbSet<Employee> Employees { get; set; }//THIS REPRESENTS A TABLE OF EMPLOYEES, <DbSet>


################
**CONFIGURING YOUR DB AND INJECTING YOUR DEPENDENCIES**
># ApplicationDbContext (Entity Framework Core)

## What is ApplicationDbContext?

* The **ApplicationDbContext** class is the bridge between an ASP.NET Core application and the database.
* It is responsible for:

  * Connecting to the database.
  * Querying data.
  * Inserting records.
  * Updating records.
  * Deleting records.
  * Saving changes.

---

## DbContext

* `DbContext` is a class provided by **Entity Framework Core**.
* It already contains all the functionality needed to communicate with a database.
* Our own `ApplicationDbContext` inherits from `DbContext` so that it gains these capabilities.

```csharp
public class ApplicationDbContext : DbContext
```

This means:
ApplicationDbContext inherits everything from DbContext.

---

## Namespace
A namespace is used to organize related classes, it's essentially a folder, and a file only has direct access to its immediate sibling so you'd have to import a folder in order to use in a different folder with `using namespace/diractive`

Example:

```
WebApplication2
│
├── Controllers
├── Models
├── Data
└── Services
```

ApplicationDbContext belongs in the **Data** namespace because it manages database access.

---

## Constructor

```csharp
public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
```

This is the constructor.

It is automatically called whenever an ApplicationDbContext object is created.

---

## DbContextOptions

```csharp
DbContextOptions<ApplicationDbContext>
```

DbContextOptions stores the database configuration.

Examples of configuration include:

* Database provider (SQL Server, SQLite, PostgreSQL, etc.)
* Connection string
* Logging options
* Entity Framework settings

The `<ApplicationDbContext>` indicates that these options belong to this specific context.

---

## options

```csharp
DbContextOptions<ApplicationDbContext> options
```

* `DbContextOptions<ApplicationDbContext>` = data type.
* `options` = variable name.

It contains the configuration passed into the constructor.

---

## base(options)

```csharp
: base(options)
```

`base` refers to the parent class (`DbContext`).

The constructor passes the configuration (`options`) to the parent class so that Entity Framework can initialize the database connection correctly.

Without this line, the parent DbContext would not receive the required configuration.

---

## Empty Constructor Body

```csharp
{

}
```

The constructor body is empty because no additional setup is needed.

All initialization is performed by the parent DbContext through:

```csharp
: base(options)
```

---

## DbSet<T>

Later, the context will contain DbSet properties.

Example:

```csharp
public DbSet<User> Users { get; set; }
public DbSet<Product> Products { get; set; }
```

A `DbSet<T>` represents a table in the database.

```
DbSet<User>      → Users table
DbSet<Product>   → Products table
DbSet<Order>     → Orders table
```

---

## Dependency Injection

ASP.NET Core automatically creates an ApplicationDbContext object.

The configuration is usually registered inside `Program.cs`.

Example:

```csharp
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"));
});
```

ASP.NET then performs something similar to:

```
Create DbContextOptions
        ↓
Create ApplicationDbContext(options)
        ↓
Pass options to DbContext using base(options)
        ↓
ApplicationDbContext is ready to use
```

---

# Key Takeaways

* `DbContext` = Parent class supplied by Entity Framework Core.
* `ApplicationDbContext` = Your application's custom database context.
* `DbContextOptions` = Stores database configuration.
* `options` = Variable containing those settings.
* `base(options)` = Passes the configuration to the parent DbContext.
* `DbSet<T>` = Represents a database table.
* ApplicationDbContext acts as the main gateway between your application and the database.

###############################################################
***************************************************************
**AFTER CREATING/DEFINING YOUR TABLES AND COLUMN IN YOU DbContextCustom**
*IN ORDER FOR C# TO ACTUALLY GO AHEAD AND CREATE THE TABLES IN THE DB, YOU MUST TELL IT TO, BY GOING TO TOOLS -> NuGET Package Manager -> Package Manager Console*
*RUN> add-migration "nameyourmigration"
*C# WILL CREATE THE [COMMANDFILE].CSS OF THE SQL IT'LL RUN TO CREATE YOUR DATABASE
*RUN> update-migration
*IT'LL GO AHEAD AND CREATE THE TABLES IN THE SQL DATABASE

**RUN THE API AND THE SWAGGERUI WILL OPEN IN THE BROWSER, SHOWING YOUR ENDPOINTS**

**CONTROLLER**
using Microsoft.AspNetCore.Mvc;
using WebApplication2.Data;
namespace WebApplication2.Controllers
{
    [ApiController]//TELLS ASP.NET THIS CLASS IS AN API CONTROLLER
    [Route("api/[controller]")]// THIS IS THE BASE URL FOR THIS CONTROLLER MUST RESPOND TO
    public class EmployeeController : Controller
    {
        private readonly ApplicationDbContext dbContext;
        public EmployeeController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;//ASP.NET WHEN A REQUEST IS SENT, CREATES THE DB CONNECTION AND THIS CONTROLLERS INSTANCE IS CREATED PASSING YOU DBCONTEXT AS THE DBCONTEXT TO USE FOR YOUR DB QUERRIES;
        }

        [HttpGet]//TELLS ASP.NET THIS METHOD MUST RESPOND TO THE GET REQUESTS SENT TO THIS CLASS/CONTROLLER'S ENDPOINT
        public IActionResult GetAllEmployees()//RETURNS IActionResult, coz a request can return many different types of responses, from errors to anything so they're categorized into IActionResult
        {
            var allEmployees = dbContext.Employees.ToList();//GET EMPLOYEES FROM THE DATABASE I.E DBCONTEXT, RETURN THEM AS A LIST, WITHOUT LIST() THIS IS JUST A QUERY NOT RUN, BUT WITH List(), THE QUERY IS QUERRIED AND CONVERTED RESULT TO A LIST()
            return Ok(allEmployees);//SERIALIZING THE JSON AND ALSO RESPONDING WITH 200 STATUS, E.G res.status(200).json(allEmployees);
            //Ok() is basically a shortcut for:
            HTTP Status Code = 200 OK
            Serialize the object to JSON
            Send it back to the client
        }
    }
}

****
**EXPRESS EQUIVALENCE TO ASP.NET**
>Express	                            ASP.NET Core

app.get("/employees", ...)          	[HttpGet]
app.post("/employees", ...)	            [HttpPost]
app.put("/employees/:id", ...)      	[HttpPut("{id}")]
app.delete("/employees/:id", ...)	    [HttpDelete("{id}")]
req.params.id	                        Guid id (or int id) parameter
req.body	                            Method parameter (e.g. Employee employee)
res.status(200).json(data)	            return Ok(data)
res.status(404)                     	return NotFound()
res.status(400)	                        return BadRequest()
express.Router()                       	Controller + Route attributes

res.status(200).json(data)	            return Ok(data)
res.status(404).json(...)	            return NotFound(...)
res.status(400).json(...)	            return BadRequest(...)
res.status(401).json(...)	            return Unauthorized()
res.status(500).json(...)	            return StatusCode(500)
res.status(201).json(...)	            return NoContent()

*NB* ASP.NET CREATES GUID DATATYPE OF ID, THAT IS SAME AS NEWID() IN SQLSERVER, AND IS NOT AN INTEGER 

**GET USER BY NAME**
>       [HttpGet("{name}")]//GET REQUEST WITH NAME PARAMETER
        public IActionResult GetEmployee(string name)//THE METHOD ACCEPTS THAT PARAMETER AS NAME
        {
            var employee = dbContext.Employees.FirstOrDefault(e => e.Name == name);//GET THAT USER

            return Ok(employee);RETURN THE EMPLOYEE
        }



****************************************
**ENTITY DTOs**
*Data Transfer Object = is a model used to transfer only the data needed between the client and the server. It protects the entity by preventing clients from reading or modifying properties they shouldn't have access to, and it decouples the API contract from the database model.
*IT BASICALLY ALLOWS YOUR API TO PROTECT SENSITIVE DATA FROM BE VIEWED OR MODIFIED BY CLIENT*
*SAY CLIENT CREATES A NEW USER, THEY SHOULD BE ABLE TO CREATE IDs, CREATEDAT TIMESTAMPS, ALSO MAYBE CLIENT WANT USER DATA, THEY SHOULDNT GET THE USERPASSWORD MAYBE, SO THIS ALLOWS THAT FILTERING*


****************************************************8888
>builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://127.0.0.1:5500",
                "http://localhost:5500"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});//CORS HERE ALLOWS THE INCLUDED FOREIGN ORIGIN ORIGIN TO TALK TO THIS SERVER, OTHERWISE OTHER ORIGINS ARE BLOCKED 

app.UseCors("AllowFrontend");//USE CORS, 

-----------------------
USING ASP.NET IDENTITY:
6. IMPLEMENT ASP.NET IDENTITY: (RESPONSIBLE FOR AUTHENTICATING AND AUTHORIZING USERS): USER ROLES ARE: ADMIN, TRAINER, GYM MEMBER;
1. STEP 1 — Install the Identity packages
1. >Install-Package Microsoft.AspNetCore.Identity.EntityFrameworkCore
1. >Install-Package  Microsoft.AspNetCore.Authentication.JwtBearer
1. ASP.NET IDENTITY, PROVIDES An IdentityUser class, that authenticates a user, with built-in properties and password hashing...you can use that default IdentityUser class, but for custom features you create your own class preferrably ApplicationUser.cs which inherits from IdentityUser, then you add additional functionalities.

using Microsoft.AspNetCore.Identity;

namespace GymManagementSystem.Models
{
    public class ApplicationUser : IdentityUser
    {
    }
}

STEP 2B — Change ApplicationDbContext
-------------------------------------
using GymManagementSystem.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace GymManagementSystem.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<GymMember> GymMembers { get; set; }
        public DbSet<PersonalTrainer> PersonalTrainers { get; set; }
        public DbSet<TrainingProgramme> TrainingProgrammes { get; set; }
        public DbSet<WorkoutPlan> WorkoutPlans { get; set; }
        public DbSet<WorkoutTask> WorkoutTasks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<PersonalTrainer>()
                .HasMany(pt => pt.GymMembers)
                .WithOne(gm => gm.PersonalTrainer)
                .HasForeignKey(gm => gm.PersonalTrainerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TrainingProgramme>()
                .HasMany(tp => tp.WorkoutPlans)
                .WithOne(wp => wp.TrainingProgramme)
                .HasForeignKey(wp => wp.TrainingProgrammeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GymMember>()
                .HasMany(gm => gm.WorkoutPlans)
                .WithOne(wp => wp.GymMember)
                .HasForeignKey(wp => wp.GymMemberId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WorkoutPlan>()
                .HasMany(wp => wp.WorkoutTasks)
                .WithOne(wt => wt.WorkoutPlan)
                .HasForeignKey(wt => wt.WorkoutPlanId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}

--------------------------
IN PROGRAM.CS::

using GymManagementSystem.Data;
using GymManagementSystem.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

    CURRENT PROGRAM.CS CODE:
    using GymManagementSystem.Data;
using Microsoft.EntityFrameworkCore;
using GymManagementSystem.Models;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
//builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DbConn")));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    //app.UseSwagger();
    //app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

--------------------------------

6.1 Create a SeedData class

In Visual Studio, go to:

GymManagementSystem
 └── Data

Right-click Data →

Add → Class

Name it:

SeedData.cs

Put this inside:

using Microsoft.AspNetCore.Identity;

namespace GymManagementSystem.Data
{
    public static class SeedData
    {
        public static async Task SeedRolesAsync(
            RoleManager<IdentityRole> roleManager)
        {
            string[] roles =
            {
                "Admin",
                "PersonalTrainer",
                "GymMember"
            };

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(
                        new IdentityRole(role));
                }
            }
        }
    }
}
🧠 What is this doing?

This method:

SeedRolesAsync()

means:

"Make sure these roles exist in the database."

We have:

string[] roles =
{
    "Admin",
    "PersonalTrainer",
    "GymMember"
};

So we're basically giving Identity a list of roles.

Then:

foreach (var role in roles)

loops through them.

For example:

Admin
   ↓
Does Admin exist?
   ↓
No
   ↓
Create Admin

Then:

PersonalTrainer
   ↓
Does PersonalTrainer exist?
   ↓
No
   ↓
Create PersonalTrainer

And the same for:

GymMember

----------------------
6.4 Run the seeding when the application starts

Now we need to actually call:

SeedRolesAsync()

Otherwise we've merely written the method — nothing would execute it.

In Program.cs, find:

var app = builder.Build();

Immediately after it, add:

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    await SeedData.SeedRolesAsync(roleManager);
}

So you'll have something like:

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();

    await SeedData.SeedRolesAsync(roleManager);
}

You may need this at the top of Program.cs:

using GymManagementSystem.Data;

You should already have that from the previous step.

------------------
THEN AFTER CREATING THE ROLES, RUN THE API, WITHOUT MIGRATION UPDATE, THIS WILL CREATE THE ROLES IN THE DB;

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

-----------------------
IDENTITY PASSWORD DEFAULTS TO SOME PASSWORD RESTRICTED REQUIREMENTS:
YOU CAN CONFIGURE THEM:
>
>builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
});

IdentityOptions also lets you configure things like:

Password rules
User settings
Lockout settings
Sign-in requirements
Allowed username characters
Unique email requirements

For example, we could eventually configure:

options.User.RequireUniqueEmail = true;

which is particularly relevant to our registration system.
---------------------------------------------

LET’S BUILD LOGIN WITH JWT 🔥

Your registration already works. Now we’ll create an endpoint that:

Receives email and password.

Finds the user.

Checks the password.

Generates a JWT token.

Returns the token to the frontend.

Step 1: Install the JWT package

In Visual Studio → Tools → NuGet Package Manager → Package Manager Console, run:

Install-Package Microsoft.AspNetCore.Authentication.JwtBearer
Step 2: Create a login DTO

Create this file:

Models/DTOs/LoginRequest.cs

Add:

using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class LoginRequest
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}

This represents the data the frontend will send when logging in.

Example:

{
  "email": "lisa@gmail.com",
  "password": "Password123!"
}
Step 3: Add JWT settings to appsettings.json

Add this section:

"Jwt": {
  "Key": "THIS_IS_A_DEVELOPMENT_SECRET_KEY_CHANGE_IT_LATER_123456789",
  "Issuer": "GymManagementSystem",
  "Audience": "GymManagementSystemUsers",
  "DurationInMinutes": 60
}

For now, this is for development. Do not commit real production secrets to GitHub.

Step 4: Add JWT configuration to Program.cs

Add these using statements at the top:

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

Before builder.Build(), add:

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is missing.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

Your service configuration should now conceptually contain:

builder.Services.AddControllers();

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

// JWT authentication configuration here

Keep your middleware in this order:

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
Step 5: Add JWT generation to AuthController

Add these namespaces:

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

Then inject IConfiguration into the controller:

private readonly UserManager<ApplicationUser> _userManager;
private readonly IConfiguration _configuration;

public AuthController(
    UserManager<ApplicationUser> userManager,
    IConfiguration configuration)
{
    _userManager = userManager;
    _configuration = configuration;
}

Now add this endpoint inside AuthController:

[HttpPost("login")]
public async Task<IActionResult> Login(LoginRequest request)
{
    var user = await _userManager.FindByEmailAsync(request.Email);

    if (user == null)
    {
        return Unauthorized(new
        {
            message = "Invalid email or password."
        });
    }

    var passwordValid = await _userManager.CheckPasswordAsync(
        user,
        request.Password
    );

    if (!passwordValid)
    {
        return Unauthorized(new
        {
            message = "Invalid email or password."
        });
    }

    var roles = await _userManager.GetRolesAsync(user);

    var claims = new List<Claim>
    {
        new Claim(
            ClaimTypes.NameIdentifier,
            user.Id
        ),

        new Claim(
            ClaimTypes.Email,
            user.Email ?? string.Empty
        ),

        new Claim(
            ClaimTypes.Name,
            user.UserName ?? string.Empty
        )
    };

    foreach (var role in roles)
    {
        claims.Add(new Claim(ClaimTypes.Role, role));
    }

    var jwtKey = _configuration["Jwt:Key"];

    if (string.IsNullOrEmpty(jwtKey))
    {
        return StatusCode(500, new
        {
            message = "JWT configuration is missing."
        });
    }

    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(jwtKey)
    );

    var credentials = new SigningCredentials(
        key,
        SecurityAlgorithms.HmacSha256
    );

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(60),
        signingCredentials: credentials
    );

    var tokenString = new JwtSecurityTokenHandler()
        .WriteToken(token);

    return Ok(new
    {
        message = "Login successful.",
        token = tokenString,
        user = new
        {
            user.Id,
            user.Name,
            user.Surname,
            user.Email,
            roles
        }
    });
}
Step 6: Test in Swagger

Run the project and open Swagger.

Use:

POST /api/Auth/login

Request body:

{
  "email": "lisa@gmail.com",
  "password": "Password123!"
}

A successful response should look similar to:

{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "some-user-id",
    "name": "lisakhanya",
    "surname": "ngwendu",
    "email": "lisa@gmail.com",
    "roles": [
      "Admin"
    ]
  }
}

The token is what your frontend will later send when calling protected endpoints.

AH — yep. This is because of the Swashbuckle/OpenAPI version you're using, and the namespace I gave you assumes the older Swagger API.

Since your project is .NET 8, let's not randomly change packages. We can fix this based on the Swagger package you actually have.

First, check your Swashbuckle version

In Package Manager Console, run:

Get-Package Swashbuckle.AspNetCore

You'll probably see something like:

Swashbuckle.AspNetCore    6.x.x
If it's 6.x

Then this namespace should work:

using Microsoft.OpenApi.Models;

And your Swagger configuration should be:

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter your JWT token."
        });

    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
});

So put these at the top of Program.cs:

using Microsoft.OpenApi.Models;

Then you don't need all those ugly:

Microsoft.OpenApi.Models.OpenApiSecurityScheme

references.

BUT before we change anything else

Run:

Get-Package Swashbuckle.AspNetCore

and send me exactly what it returns.

Because your earlier JWT issue happened specifically because NuGet grabbed a newer major version, and I don't want to make the same mistake with Swagger. We'll use the version you actually have installed.

its actually 10.2.3

AHHH, that's exactly why. You're on Swashbuckle.AspNetCore 10.2.3, and v10 introduced breaking changes to the OpenAPI types. In v10, Microsoft.OpenApi.Models was replaced by Microsoft.OpenApi.

So my previous code was using the old v9-and-earlier syntax. Let's use the correct v10.2.3 syntax.

1. Change your using

If you currently have:

using Microsoft.OpenApi.Models;

change it to:

using Microsoft.OpenApi;
2. Use the v10 JWT Swagger configuration

For Swashbuckle 10.2.3, use:

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        });
});

This is the current v10-style approach documented by the Swashbuckle project.

Notice the differences

Old code:

using Microsoft.OpenApi.Models;

❌ Not for v10.

New:

using Microsoft.OpenApi;

And old security requirement code used:

Reference = new OpenApiReference
{
    Type = ReferenceType.SecurityScheme,
    Id = "Bearer"
}

That's also old syntax.

v10 uses:

new OpenApiSecuritySchemeReference("Bearer", document)

instead.

3. Don't change your package

You do NOT need to downgrade Swashbuckle.

You have:

.NET 8
Swashbuckle.AspNetCore 10.2.3

That's okay. Swashbuckle v10's breaking changes are primarily around its underlying Microsoft.OpenApi v2 API, not because your project suddenly needs .NET 10.

So we're going to work with what you already have.

Your Program.cs Swagger section should now be:
using Microsoft.OpenApi;

// other using statements...

// ...

builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });

    options.AddSecurityRequirement(document =>
        new OpenApiSecurityRequirement
        {
            [new OpenApiSecuritySchemeReference("Bearer", document)] = []
        });
});

Don't add the JWT authentication configuration yet. First make sure this Swagger code builds successfully.

Then we'll move on to the actual:

JWT Bearer authentication

configuration in Program.cs.

curl -X 'GET' \
  'https://localhost:7007/api/GymMembers' \
  -H 'accept: */*'
Request URL
https://localhost:7007/api/GymMembers
Server response
Code	Details	
401	Undocumented	

Error: response status is 401

Response headers
 content-length: 0  date: Sun,20 Sep 2026 14:26:26 GMT  server: Kestrel  www-authenticate: Bearer 
Responses
Code	Description	Links
200		

OK

YESSS 🔥 THAT 401 IS EXACTLY WHAT WE WANTED.

Your [Authorize] is working.

Look at this:

401 Unauthorized

and especially:

www-authenticate: Bearer

That tells us ASP.NET is saying:

"This endpoint requires a Bearer authentication token, but you didn't provide one."

So your flow is currently:

GET /api/GymMembers
        ↓
[Authorize]
        ↓
JWT required
        ↓
No JWT provided
        ↓
401 Unauthorized ✅

The reason Swagger says "Undocumented" is simply that we haven't told Swagger that 401 is one of the possible responses. It does NOT mean your API is broken.

NOW WE DO THE IMPORTANT PART 🔥

We need to connect your JWT login to this protected endpoint.

Right now you have:

Registration
     ↓
ApplicationUser created
     ↓
Login
     ↓
JWT generated

But ASP.NET still needs to be configured to validate that JWT when somebody calls:

/api/GymMembers

That's what we're doing next.

Add JWT authentication to Program.cs

At the top:

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

Then, before var app = builder.Build();, add:

var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT key is missing.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],

            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],

            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };
    });
And make sure your middleware is:
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

Authentication MUST come before Authorization.

UseAuthentication()
        ↓
"Who is this?"
        ↓
UseAuthorization()
        ↓
"What are they allowed to access?"
BUT ONE THING

Before you paste that, I want to make sure we're using the exact JWT settings we already created.

Your appsettings.json should have something like:

"Jwt": {
  "Key": "YOUR_SECRET_KEY",
  "Issuer": "GymManagementSystem",
  "Audience": "GymManagementSystemUsers",
  "DurationInMinutes": 60
}

If you've already added that, we're good.

Then we'll do the really satisfying test:

POST /api/Auth/login
        ↓
JWT returned
        ↓
Swagger 🔒 Authorize
        ↓
GET /api/GymMembers
        ↓
200 OK 🎯

Paste your current Program.cs now so I can integrate the JWT configuration into your actual file rather than having you guess where it goes.

---------------------------------------------------

🔥 PERFECT. You now have real JWT authentication working.

Now let's move from "Are you logged in?" to "What are you allowed to do?"

That's authorization with roles.

Your roles are:

Admin
PersonalTrainer
GymMember

We're going to make your GymMembersController demonstrate this.

STEP 1 — Make GET accessible to any logged-in user

Your controller currently has:

[Authorize]
public class GymMembersController : ControllerBase

Keep that.

So:

Admin          → ✅
PersonalTrainer → ✅
GymMember      → ✅
Not logged in  → ❌ 401

That's reasonable because authenticated users can access gym-member information.

STEP 2 — Add an Admin-only endpoint

Let's add a simple test endpoint first.

Inside GymMembersController:

[HttpDelete("{id}")]
[Authorize(Roles = "Admin")]
public IActionResult DeleteMember(int id)
{
    return Ok(new
    {
        message = $"Member {id} deleted successfully."
    });
}

Your controller will now look like:

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GymManagementSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GymMembersController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetMembers()
        {
            return Ok(new
            {
                message = "Gym members endpoint is working."
            });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public IActionResult DeleteMember(int id)
        {
            return Ok(new
            {
                message = $"Member {id} deleted successfully."
            });
        }
    }
}
STEP 3 — Understand what the two [Authorize] attributes are doing

This is important.

At the controller:

[Authorize]

means:

You must be logged in.

But here:

[Authorize(Roles = "Admin")]

we're saying:

You must be logged in AND have the Admin role.

So the DELETE endpoint requires both.

                    DELETE
                       │
                       ▼
                Are you logged in?
                  /          \
                NO            YES
                │              │
              401              ▼
                         Are you Admin?
                           /       \
                         NO         YES
                         │           │
                        403         200

That's the difference we talked about earlier:

401
"I don't know who you are."

No valid JWT.

403
"I know who you are,
but you don't have permission."

Valid JWT but wrong role.

STEP 4 — Test with your current Admin account

You're currently using:

lisa@gmail.com

and that account has:

Admin

So with your JWT authorized in Swagger, try:

DELETE /api/GymMembers/1

You should get:

200 OK

and:

{
  "message": "Member 1 deleted successfully."
}

Nothing is actually being deleted yet. We're just testing authorization.

STEP 5 — Why this matters

This is the foundation of your gym system's security.

Eventually your API can look like:

ADMIN
├── Manage gym members
├── Manage trainers
├── Manage subscriptions
├── Manage payments
└── Manage system users

PERSONAL TRAINER
├── View assigned members
├── Create workout plans
├── Update workout plans
└── View member progress

GYM MEMBER
├── View own profile
├── View own workout plan
├── View subscription
└── View own progress

We're not implementing all of that at once.

First we're proving that the role system works.

STEP 6 — There's one security problem we need to fix

Remember your registration endpoint?

You currently have:

{
  "name": "John",
  "surname": "Doe",
  "email": "john@gmail.com",
  "password": "Password123!",
  "role": "Admin"
}

That means anyone who can access registration can potentially request:

role = Admin

🚨 We must fix that before this becomes a real application.

The normal registration flow should be:

POST /api/Auth/register
        │
        ▼
Create account
        │
        ▼
Automatically assign
"GymMember"

Then an Admin can create/assign:

Admin
PersonalTrainer
GymMember

through a protected admin operation.

So before we start building real CRUD operations, let's fix that registration vulnerability.

Next change

We'll remove Role from:

RegisterRequest

and change:

request.Role

to simply:

"GymMember"

Then we'll create an Admin-only user management endpoint for creating trainers/admins.

That gives us a much more realistic architecture:

PUBLIC REGISTRATION
        ↓
   GymMember only

ADMIN
   ↓
Create/manage
   ├── GymMember
   ├── PersonalTrainer
   └── Admin

That's the next piece I'd do before touching the actual database CRUD.

------------------------------------------------------

YEP 🔥 This is an important fix. Right now a user can basically walk into the registration endpoint and say "make me Admin". We're removing that.

We want:

PUBLIC REGISTRATION
       ↓
   GymMember

Only privileged users will eventually be able to create Admins/Personal Trainers.

1. Remove Role from RegisterRequest

Open:

Models/DTOs/RegisterRequest.cs

You currently have:

[Required]
public string Role { get; set; } = string.Empty;

Delete those two lines.

Your DTO should now be:

using System.ComponentModel.DataAnnotations;

namespace GymManagementSystem.Models.DTOs
{
    public class RegisterRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Surname { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Password { get; set; } = string.Empty;
    }
}

So the client can now send only:

{
  "name": "John",
  "surname": "Doe",
  "email": "john@gmail.com",
  "password": "Password123!"
}

There is no role field anymore.

2. Change AuthController

Open:

Controllers/AuthController.cs

Find this:

var roleExists = await _userManager.IsInRoleAsync(
    user,
    request.Role
);

if (!roleExists)
{
    var roleResult = await _userManager.AddToRoleAsync(
        user,
        request.Role
    );

    if (!roleResult.Succeeded)
    {
        return BadRequest(roleResult.Errors);
    }
}

Replace that entire section with:

var roleResult = await _userManager.AddToRoleAsync(
    user,
    "GymMember"
);

if (!roleResult.Succeeded)
{
    return BadRequest(roleResult.Errors);
}

Now every public registration automatically becomes a GymMember.

3. Your registration flow is now
POST /api/Auth/register
          │
          ▼
    Create user
          │
          ▼
    Identity hashes
      password
          │
          ▼
    Assign GymMember
          │
          ▼
       Success

The client has zero control over the role.

That's much better.

4. Test it in Swagger

Rebuild and run.

Go to:

POST /api/Auth/register

Your Swagger request should now look like:

{
  "name": "John",
  "surname": "Doe",
  "email": "john@gmail.com",
  "password": "Password123!"
}

Notice:

role

is gone.

Execute it.

You should receive:

{
  "message": "User registered successfully."
}
5. Verify the role

Now login as John:

POST /api/Auth/login
{
  "email": "john@gmail.com",
  "password": "Password123!"
}

The response should contain:

"roles": [
    "GymMember"
]

🔥 That proves the server assigned the role, rather than trusting the client.

One more important thing

Your existing:

lisa@gmail.com

account is still:

Admin

because we aren't changing existing users.

The change only affects new registrations.

So you'll have:

lisa@gmail.com
    ↓
Admin

newuser@gmail.com
    ↓
GymMember
Then we'll build the proper Admin operation

Once this works, the next logical piece is:

POST /api/Admin/users

protected with:

[Authorize(Roles = "Admin")]

That endpoint can allow an Admin to create:

GymMember
PersonalTrainer
Admin

That way role assignment happens only through a privileged operation.

And then we can start building the actual GymMember CRUD using your database, rather than our temporary "Gym members endpoint is working." response.
-----------------------------------------------------------
YES — this is an important distinction, and you're right: the original version worked perfectly without async/await.

Let's break down exactly what changed.

1. Your original version

You had:

[HttpGet]
public IActionResult GetMembers()
{
    return Ok(_context.GymMembers.ToList());
}

The important part is:

_context.GymMembers.ToList()

ToList() is a synchronous database operation.

It basically says:

"Go to the database, wait until the database gives me the results, then continue."

So the flow is:

API request
    ↓
Controller
    ↓
ToList()
    ↓
WAIT for SQL Server
    ↓
Get results
    ↓
return Ok()

It works. There's nothing inherently wrong with it for a simple application.

2. The new version

We changed it to:

[HttpGet]
public async Task<IActionResult> GetMembers()
{
    var members = await _context.GymMembers.ToListAsync();

    return Ok(members);
}

Now there are three different things to understand:

async
Task<IActionResult>
await

They're related, but they are not the same thing.

3. What does Task mean?

This is probably the biggest piece you're missing.

When you write:

Task<IActionResult>

you can think of Task as:

"This method will eventually produce an IActionResult, but it may not have it immediately."

Imagine ordering food at a restaurant.

If you say:

"Give me the food."

You don't necessarily receive the food immediately.

Instead, you receive something representing:

"Your food is being prepared. I'll give you the actual food when it's ready."

That's roughly what a Task represents.

Without Task:
IActionResult GetMembers()

means:

This method returns an IActionResult.

With Task:
Task<IActionResult> GetMembers()

means:

This method returns a Task that will eventually contain an IActionResult.

4. So what does await do?

This:

await _context.GymMembers.ToListAsync();

means:

"Start this database operation and asynchronously wait for its result."

The important thing is that waiting asynchronously isn't the same as blocking the thread.

Compare:

Synchronous
var members = _context.GymMembers.ToList();

The current thread basically says:

"I'm waiting here until SQL Server finishes."

Asynchronous
var members = await _context.GymMembers.ToListAsync();

The method says:

"The database operation is running. I don't need to occupy this thread while waiting. Resume this method when the result is ready."

That's particularly useful for web servers because they may have many requests happening simultaneously.

5. Then why did the old version work?

Because async isn't required for a database query to work.

This:

_context.GymMembers.ToList()

works.

This:

await _context.GymMembers.ToListAsync()

also works.

Both ultimately give you:

List<GymMember>

The difference is how the application waits for the database operation.

6. Think about it using your Node/Express knowledge

You already know this kind of code:

app.get("/members", async (req, res) => {
    const members = await GymMember.find();

    res.status(200).json(members);
});

Notice:

async
await

You don't usually do:

const members = GymMember.find();

because find() returns a Promise.

C#'s equivalent concept is Task.

Very roughly:

JavaScript	C#
Promise	Task
async	async
await	await
res.json(data)	Ok(data)

So you can think:

Promise

≈

Task

Not exactly identical internally, but that's an excellent mental model for you.

7. Why does ToListAsync() return a Task?

This is the key connection.

You have:

ToList()

which returns:

List<GymMember>

But:

ToListAsync()

returns something like:

Task<List<GymMember>>

Because the result isn't available immediately.

So:

var members = await _context.GymMembers.ToListAsync();

After await finishes, members becomes:

List<GymMember>

That's why you don't write:

Task<List<GymMember>> members

yourself.

await unwraps the eventual result for you.

8. And that's why the method becomes Task<IActionResult>

Look at the whole chain:

_context.GymMembers.ToListAsync()

returns:

Task<List<GymMember>>

Then:

await ...

gives you:

List<GymMember>

Then:

return Ok(members);

gives you:

IActionResult

But because the method itself is asynchronous, its final return type is:

Task<IActionResult>

So:

public async Task<IActionResult> GetMembers()

means:

"This is an asynchronous method that will eventually give the caller an IActionResult."

9. One more important thing: async doesn't automatically make something asynchronous

This is a common misconception.

This:

public async Task<IActionResult> GetMembers()
{
    var members = _context.GymMembers.ToList();

    return Ok(members);
}

is not what we want.

You've declared the method async, but you're still using:

ToList()

which is synchronous.

The useful combination is:

public async Task<IActionResult> GetMembers()
{
    var members = await _context.GymMembers.ToListAsync();

    return Ok(members);
}

So remember the pairing:

Synchronous:
ToList()
    ↓
IActionResult

Asynchronous:
ToListAsync()
    ↓
await
    ↓
Task<IActionResult>
The rule I want you to remember

When you're doing EF Core database operations in your API, you'll commonly see:

public async Task<IActionResult>

with:

await _context.Something.ToListAsync();

because database operations involve waiting on an external resource, and asynchronous EF Core lets the server handle that waiting more efficiently.

Your original code wasn't wrong. We're just moving from synchronous database access to the asynchronous pattern you'll see throughout modern ASP.NET Core APIs.

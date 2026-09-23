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


            // ApplicationUser → GymMember
            modelBuilder.Entity<GymMember>()
                .HasOne(gm => gm.ApplicationUser)
                .WithOne()
                .HasForeignKey<GymMember>(gm => gm.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ApplicationUser → PersonalTrainer
            modelBuilder.Entity<PersonalTrainer>()
                .HasOne(pt => pt.ApplicationUser)
                .WithOne()
                .HasForeignKey<PersonalTrainer>(pt => pt.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);

            //MAKING MEMBER && STAFF NUMBER UNIQUE
            modelBuilder.Entity<GymMember>()
                .HasIndex(m => m.MemberNumber)
                .IsUnique();

            modelBuilder.Entity<PersonalTrainer>()
             .HasIndex(m => m.StaffNumber)
             .IsUnique();

            //ADDING ENTITY RELATIONSHIPS
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
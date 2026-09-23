using System.Security.Cryptography;

namespace GymManagementSystem.Services
{
    public class NumberGeneratorService
    {
        private const string Characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

        public string Generate(string prefix)
        {
            var randomPart = new char[6];

            for (int i = 0; i < randomPart.Length; i++)
            {
                randomPart[i] = Characters[
                    RandomNumberGenerator.GetInt32(Characters.Length)
                ];
            }

            return $"{prefix}-{new string(randomPart)}";
        }
    }
}
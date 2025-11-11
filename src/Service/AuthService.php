<?php

namespace App\Service;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Component\Security\Core\User\UserProviderInterface;

class AuthService
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager,
        private UserProviderInterface $userProvider,
        private UserRepository $userRepository,
        private UserService $userService  // Inject UserService to handle user creation
    ) {}

    /**
     * Register a new user
     * @param array $data ['email' => ..., 'password' => ..., 'name' => ...]
     * @return User The created user entity
     */
    public function register(array $data): User
    {
        $user = $this->userService->createUser($data);
        return $user;
    }

    /**
     * Login method that returns JWT token
     * @param string $email
     * @param string $password
     * @return string|null JWT token if successful, null otherwise
     */
    public function login(string $email, string $password): ?string
    {
        $user = $this->userRepository->findOneBy(['email' => $email]);

        if (!$user) {
            throw new \Exception('User not found');
        }

        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            throw new \Exception('Invalid credentials');
        }

        return $this->jwtManager->create($user);
    }

    /**
     * Logout method (for JWT, this is typically handled on the client side)
     */
    public function logout(): void
    {
        // With JWT, logout is typically handled on the client side by deleting the token.
        // Optionally, you can implement token blacklisting here.
    }
}
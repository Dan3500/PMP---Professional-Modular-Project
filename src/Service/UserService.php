<?php

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use App\Exception\UserRegisteredException;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;

class UserService
{
    public function __construct(
        private EntityManagerInterface $em,
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    /**
     * Get user by ID
     * @param int $id
     * @return User|null
     */
    public function getUserById(int $id): ?User
    {
        return $this->em->getRepository(User::class)->find($id);
    }

    /**
     * Get user by email
     * @param string $email
     * @return User|null
     */
    public function getUserByEmail(string $email): ?User
    {
        return $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
    }

    /**
     * Get user by name
     * @param string $name
     * @return User|null
     */
    public function getUserByName(string $name): ?User
    {
        return $this->em->getRepository(User::class)->findOneBy(['name' => $name]);
    }

    /**
     * Get all users
     * @return User[]
     */
    public function getAllUsers(): array
    {
        return $this->em->getRepository(User::class)->findAll();
    }

    public function createUser(array $data): User
    {
        // Optimistic check: see if a user with the email already exists
        $existing = $this->getUserByEmail($data['email']);
        if ($existing) {
            throw new UserRegisteredException();
        }

        $user = new User();
        $user->setEmail($data['email']);
        $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        $user->setName($data['name']);

        try {
            $this->em->getRepository(User::class)->save($user, true);
        } catch (UniqueConstraintViolationException $e) {
            // Race condition: another request inserted the same email between the check and the flush
            throw new UserRegisteredException('User with this email is already registered.', 409);
        }

        return $user;
    }

    /**
     * Update user details
     * @param User $user
     * @param array $data
     * @return User
     */
    public function updateUser(User $user, array $data): User
    {
        if (isset($data['email'])) {
            $user->setEmail($data['email']);
        }else{
            $user->setEmail($user->getEmail());
        }
        if (isset($data['password'])) {
            $user->setPassword($this->passwordHasher->hashPassword($user, $data['password']));
        }else{
            $user->setPassword($user->getPassword());
        }
        if (isset($data['name'])) {
            $user->setName($data['name']);
        }else{
            $user->setName($user->getName());
        }
        if (isset($data['roles'])) {
            $user->setRole($data['roles']);
        }else{
            $user->setRole($user->getRoles());
        }
        if (isset($data['is_active'])) {
            $user->setIsActive($data['is_active']);
        }else{
            $user->setIsActive($user->isActive());
        }

        $user->setUpdatedAt(new \DateTimeImmutable());

        try {
            $this->em->getRepository(User::class)->save($user, true);
        } catch (UniqueConstraintViolationException $e) {
            // Race condition: another request inserted the same email between the check and the flush
            throw new UserRegisteredException('User with this email is already registered.', 409);
        }

        return $user;
    }


    /**
     * Active/Deactivate user
     * @param User $user
     * @param array $data
     * @return User
     */
    public function activeUser(User $user, array $data): User
    {
        $user->setIsActive(!$user->isActive());
        
        try {
            $this->em->getRepository(User::class)->save($user, true);
        } catch (UniqueConstraintViolationException $e) {
            // Race condition: another request inserted the same email between the check and the flush
            throw new UserRegisteredException('User with this email is already registered.', 409);
        }

        return $user;
    }

    /**
     * Delete a user
     * @param User $user
     * @return void
     */
    public function deleteUser(User $user): void
    {
        $this->em->remove($user);
        $this->em->flush();
    }
}

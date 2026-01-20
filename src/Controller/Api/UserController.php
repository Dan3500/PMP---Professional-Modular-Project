<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\DTO\UserDTO;
use App\Repository\UserRepository;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
/**
 * Controller for operations related to users.
 *
 * Routes grouped under the `/api` prefix (attribute route on the class).
 * Contains endpoints for both authenticated users and administrative operations.
 *
 * Best practices for methods:
 * - Use DTOs when the operation receives/returns complex structures.
 * - Validate input with Symfony's Validator.
 * - Return correct HTTP status codes (200, 201, 204, 400, 404, 401, 403, ...).
 */
class UserController extends AbstractController
{
    public function __construct(private UserService $userService)
    {
    }

    // Endpoints for operations with the authenticated user's profile

    #[Route('/users/me', name: 'api_user_me', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getProfile(): JsonResponse
    {
        // getUser() returns the authenticated user entity (or null if no session)
        $user = $this->getUser();
        $userDto = UserDTO::fromEntity($user);
        return $this->json([
            'success' => true,
            'data' => $userDto,
            'message' => 'Profile retrieved successfully'
        ], 200, [], ['groups' => ['user:read']]);
    }

    #[Route('/users/me', name: 'api_user_update_me', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();

        // JSON is expected in the body with the fields to update
        $data = json_decode($request->getContent(), true);

        // Delegate update logic to the service (encapsulates validations/transformations)
        $updated = $this->userService->updateUser($user, $data);
        $userDto = UserDTO::fromEntity($updated);
        return $this->json([
            'success' => true,
            'data' => $userDto,
            'message' => 'Profile updated successfully'
        ], 200, [], ['groups' => ['user:read']]);
    }

    // Endpoints for administration (requires ROLE_ADMIN)

    #[Route('/v1/admin/users', name: 'api_admin_users_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listUsers(UserRepository $repo): JsonResponse
    {
        // List of all users (pagination could be added here)
        $users = $repo->findAll();
        $userDtos = array_map(fn($user) => UserDTO::fromEntity($user), $users);
        return $this->json([
            'success' => true,
            'data' => $userDtos,
            'message' => 'Users retrieved successfully'
        ], 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/users/{id}', name: 'api_admin_users_get', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUserById(int $id, UserRepository $repo): JsonResponse
    {
        // Search for user by id; return 404 if not found
        $user = $repo->find($id);
        if (!$user) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found'
            ], 404);
        }

        $userDto = UserDTO::fromEntity($user);
        return $this->json([
            'success' => true,
            'data' => $userDto,
            'message' => 'User retrieved successfully'
        ], 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/user', name: 'api_admin_users_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createUser(Request $request): JsonResponse
    {
        // Create a user from the received JSON
        $data = json_decode($request->getContent(), true);
        $newUser = $this->userService->createUser($data);
        $userDto = UserDTO::fromEntity($newUser);
        return $this->json([
            'success' => true,
            'data' => $userDto,
            'message' => 'User created successfully'
        ], 201, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/user/{id}', name: 'api_admin_users_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateUser(Request $request, int $id, UserRepository $repo): JsonResponse
    {
        // Find user by id; return 404 if not found
        $user = $repo->find($id);
        if (!$user) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found'
            ], 404);
        }

        // Updates the User entity with the body data
        $data = json_decode($request->getContent(), true);
        $updated = $this->userService->updateUser($user, $data);
        $userDto = UserDTO::fromEntity($updated);
        return $this->json([
            'success' => true,
            'data' => $userDto,
            'message' => 'User updated successfully'
        ], 200, [], ['groups' => ['admin:read']]);
    }


    #[Route('/v1/admin/user/activate/{id}', name: 'api_admin_users_activate', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function activateUser(Request $request, int $id, UserRepository $repo): JsonResponse
    {
        // Find user by id; return 404 if not found
        $user = $repo->find($id);
        if (!$user) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found'
            ], 404);
        }

        // Updates the User entity with active status from the body data
        $data = json_decode($request->getContent(), true);
        $updated = $this->userService->activeUser($user, $data);
        $userDto = UserDTO::fromEntity($updated);
        return $this->json([
            'success' => true,
            'data' => $userDto,
            'message' => 'User updated successfully'
        ], 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/user/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteUser(int $id, UserRepository $repo): JsonResponse
    {
        // Search for user by id; return 404 if not found
        $user = $repo->find($id);
        if (!$user) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'User not found'
            ], 404);
        }

        // Delete user (service may handle soft-delete or additional validations)
        $this->userService->deleteUser($user);
        return $this->json([
            'success' => true,
            'data' => null,
            'message' => 'User deleted successfully'
        ], 204);
    }
}

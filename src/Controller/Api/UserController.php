<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
class UserController extends AbstractController
{
    public function __construct(private UserService $userService)
    {
        
    }

    // =============================
    // 🧍‍♂️ ENDPOINTS for User
    // =============================

    #[Route('/users/me', name: 'api_user_me', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getProfile(): JsonResponse
    {
        $user = $this->getUser();
        return $this->json($user, 200, [], ['groups' => ['user:read']]);
    }

    #[Route('/users/me', name: 'api_user_update_me', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        $updated = $this->userService->updateUser($user, $data);
        return $this->json($updated, 200, [], ['groups' => ['user:read']]);
    }

    // =============================
    // 🛠️ ENDPOINTS for CRUD Admin
    // =============================

    #[Route('/admin/users', name: 'api_admin_users_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listUsers(UserRepository $repo): JsonResponse
    {
        $users = $repo->findAll();
        return $this->json($users, 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/admin/users/{id}', name: 'api_admin_users_get', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUserById(int $id, UserRepository $repo): JsonResponse
    {
        $user = $repo->find($id);
        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        return $this->json($user, 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/admin/user-create', name: 'api_admin_users_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createUser(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $newUser = $this->userService->createUser($data);
        return $this->json($newUser, 201, [], ['groups' => ['admin:read']]);
    }

    #[Route('/admin/user-update', name: 'api_admin_users_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $updated = $this->userService->updateUser($user, $data);
        return $this->json($updated, 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/admin/user-delete', name: 'api_admin_users_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteUser(User $user): JsonResponse
    {
        $this->userService->deleteUser($user);
        return $this->json(null, 204);
    }
}

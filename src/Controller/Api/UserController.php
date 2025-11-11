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
/**
 * Controller para operaciones relacionadas con usuarios.
 *
 * Rutas agrupadas bajo el prefijo `/api` (attribute route en la clase).
 * Contiene endpoints tanto para usuarios autenticados como para operaciones administrativas.
 *
 * Buenas prácticas en los métodos:
 * - Usar DTOs cuando la operación reciba/retorne estructuras complejas.
 * - Validar la entrada con el Validator de Symfony.
 * - Devolver códigos HTTP correctos (200, 201, 204, 400, 404, 401, 403, ...).
 */
class UserController extends AbstractController
{
    public function __construct(private UserService $userService)
    {
    }

    // Endpoints para operaciones con el perfil del usuario autenticado

    #[Route('/users/me', name: 'api_user_me', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getProfile(): JsonResponse
    {
        // getUser() devuelve la entidad del usuario autenticado (o null si no hay sesión)
        $user = $this->getUser();
        return $this->json($user, 200, [], ['groups' => ['user:read']]);
    }

    #[Route('/users/me', name: 'api_user_update_me', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $this->getUser();

        // Se espera JSON en el cuerpo con los campos a actualizar
        $data = json_decode($request->getContent(), true);

        // Delegamos la lógica de actualización al servicio (encapsula validaciones/transformaciones)
        $updated = $this->userService->updateUser($user, $data);
        return $this->json($updated, 200, [], ['groups' => ['user:read']]);
    }

    // Endpoints para administración (requieren ROLE_ADMIN)

    #[Route('/admin/users', name: 'api_admin_users_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listUsers(UserRepository $repo): JsonResponse
    {
        // Listado de todos los usuarios (paginación podría añadirse aquí)
        $users = $repo->findAll();
        return $this->json($users, 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/admin/users/{id}', name: 'api_admin_users_get', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getUserById(int $id, UserRepository $repo): JsonResponse
    {
        // Buscar el usuario por id; devolver 404 si no existe
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
        // Crear un usuario a partir del JSON recibido
        $data = json_decode($request->getContent(), true);
        $newUser = $this->userService->createUser($data);
        return $this->json($newUser, 201, [], ['groups' => ['admin:read']]);
    }

    #[Route('/admin/user-update', name: 'api_admin_users_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateUser(Request $request, User $user): JsonResponse
    {
        // Actualiza la entidad User pasada por param converter con los datos del body
        $data = json_decode($request->getContent(), true);
        $updated = $this->userService->updateUser($user, $data);
        return $this->json($updated, 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/admin/user-delete', name: 'api_admin_users_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteUser(User $user): JsonResponse
    {
        // Eliminar usuario (servicio puede manejar soft-delete o validaciones adicionales)
        $this->userService->deleteUser($user);
        return $this->json(null, 204);
    }
}

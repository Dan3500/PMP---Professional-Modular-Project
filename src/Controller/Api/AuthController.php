<?php

namespace App\Controller\Api;

use App\DTO\RegisterDTO;
use App\DTO\LoginDTO;
use App\DTO\UserDTO;
use App\Service\AuthService;
use App\Exception\UserRegisteredException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

class AuthController extends AbstractController
{
    /**
     * Controller for User REGISTER and LOGIN operations.
     * @param AuthService $authService 
     * @param SerializerInterface $serializer Serializer for JSON to DTOs
     * @param ValidatorInterface $validator Validator for DTOs
     */
    public function __construct(
        private AuthService $authService,
        private SerializerInterface $serializer,
        private ValidatorInterface $validator
    ) {}

    /**
     * Register a new user.
     *
     * - Deserialize the JSON body to RegisterDTO.
     * - Validate the DTO; if there are errors, respond with 400 and details.
     * - Delegate creation to AuthService and return 201 with the id.
     * 
     * @param Request $request HTTP Request with JSON in the body
     * @return JsonResponse JSON response with status and minimal data
     */
    #[Route('/v1/register', name: 'app_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $dto = $this->serializer->deserialize($request->getContent(), RegisterDTO::class, 'json');

        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(
                ["success" => false, 
                "data" => [], 
                "message" => (string) $errors
            ], 400, [], ['groups' => ['public']]);
        }

        try {
            $user = $this->authService->register([
                'email' => $dto->email,
                'password' => $dto->password,
                'name' => $dto->name
            ]);
        } catch (UserRegisteredException $e) {
            return $this->json(
                ["success" => false, 
                "data" => [],
                "message" => (string) $e->getMessage()
            ], 409, [], ['groups' => ['public']]);
        }

        $userDto = UserDTO::fromEntity($user);
        return $this->json([
            "success" => true, 
            "data" => ["user"=>$userDto], 
            "message" => "User registered successfully"
        ], 201, [], ['groups' => ['public', 'user:read']]);
    }


    /**
     * Login a user and return a JWT token.
     *
     * - Deserialize LoginDTO
     * - Validate DTO
     * - Delegate authentication to AuthService and return token
     *
     * @param Request $request JSON -> {"email":"...","password":"..."}
     * @return JsonResponse {"token":"..."} or 400 in case of validation errors
     */
    #[Route('/v1/login', name: 'app_login', methods: ['POST'])]
    public function login(Request $request): JsonResponse
    {
        // Deserialize LoginDTO
        $dto = $this->serializer->deserialize($request->getContent(), LoginDTO::class, 'json');

        // Validate DTO
        $errors = $this->validator->validate($dto);
        if (count($errors) > 0) {
            return $this->json(
                ['success' => false, 
                "data"=>[], 
                'message' => (string) $errors
            ], 401, [], ['groups' => ['public']]);
        }

        // AuthService sends back the JWT token
        try {
            $token = $this->authService->login($dto->email, $dto->password);
        } catch (\Exception $e) {
            return $this->json(
                ['success' => false, 
                "data"=>[], 
                'message' => $e->getMessage()], 401);
        }

        return $this->json([
            'success' => true, 
            "data"=>[
                'token' => $token,
                'user' => UserDTO::fromEntity($this->authService->getUserByEmail($dto->email))], 
            'message' => 'Logged in successfully'
        ], 200,[], ['groups' => ['public', 'user:read']]);
    }

    /**
     * Logout endpoint (for JWT, this is typically handled on the client side)
     * @return JsonResponse
     */
    #[Route('/logout', name: 'app_logout', methods: ['POST'])]
    public function logout(): JsonResponse
    {
        $this->authService->logout();
        return $this->json(
            ['success' => true, 
            "data" => [], 
            'message' => 'Logged out successfully'], 204);
    }

}
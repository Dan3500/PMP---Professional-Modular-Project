<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\DTO\PostDTO;
use App\Repository\PostRepository;;
use App\Service\PostService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api')]
/**
 * Controller for operations related to posts.
 *
 * Routes grouped under the `/api` prefix (attribute route on the class).
 * Contains endpoints for both authenticated users and administrative operations.
 *
 * Best practices for methods:
 * - Use DTOs when the operation receives/returns complex structures.
 * - Return correct HTTP status codes (200, 201, 204, 400, 404, 401, 403, ...).
 */
class PostController extends AbstractController
{
    public function __construct(
        private PostService $postService
    )
    {}

    // Endpoints for operations with the authenticated user's profile

    #[Route('/v1/posts', name: 'api_post_get_all', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getAll(): JsonResponse
    {
        $posts = $this->postService->getAllPosts();
        $postDtos = array_map(fn($post) => PostDTO::fromEntity($post), $posts);
        
        $groups = $this->isGranted('ROLE_ADMIN') ? ['admin:read'] : ['post:read'];
        
        return $this->json([
            'success' => true,
            'data' => $postDtos,
            'message' => 'Posts retrieved successfully'
        ], 200, [], ['groups' => $groups]);
    }


    #[Route('/v1/posts/{id}', name: 'api_post_get_by_id', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getPostById(int $id): JsonResponse
    {
        $post = $this->postService->getPostById($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }
        
        $postDTO = PostDTO::fromEntity($post);
        $groups = $this->isGranted('ROLE_ADMIN') ? ['admin:read'] : ['post:read'];
        
        return $this->json([
            'success' => true,
            'data' => $postDTO,
            'message' => 'Post retrieved successfully'
        ], 200, [], ['groups' => $groups]);
    }

    #[Route('/v1/posts/{id}', name: 'api_post_update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updatePost(int $id, Request $request): JsonResponse
    {
        $post = $this->postService->getPostById($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);
        $updated = $this->postService->updatePost($post, $data);
        $postDTO = PostDTO::fromEntity($updated);
        
        $groups = $this->isGranted('ROLE_ADMIN') ? ['admin:read'] : ['post:read'];
        
        return $this->json([
            'success' => true,
            'data' => $postDTO,
            'message' => 'Post updated successfully'
        ], 200, [], ['groups' => $groups]);
    }

    // Endpoints for administration (requires ROLE_ADMIN)


    #[Route('/v1/posts/create', name: 'api_admin_post_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createPost(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $newPost = $this->postService->createPost($data);
        $postDTO = PostDTO::fromEntity($newPost);
        return $this->json([
            'success' => true,
            'data' => $postDTO,
            'message' => 'Post created successfully'
        ], 201, [], ['groups' => ['admin:read']]);
    }


    #[Route('/v1/posts/activate/{id}', name: 'api_admin_post_activate', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function activatePost(Request $request, int $id): JsonResponse
    {
        $post = $this->postService->getPostById($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }
        
        $data = json_decode($request->getContent(), true);
        $updated = $this->postService->activePost($post, $data);
        $postDTO = PostDTO::fromEntity($updated);
        
        $groups = $this->isGranted('ROLE_ADMIN') ? ['admin:read'] : ['post:read'];
        
        return $this->json([
            'success' => true,
            'data' => $postDTO,
            'message' => 'Post updated successfully'
        ], 200, [], ['groups' => $groups]);
    }

    #[Route('/v1/posts/{id}/read', name: 'api_post_set_read', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function setPostAsRead(int $id, Request $request): JsonResponse
    {
        $post = $this->postService->getPostById($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }

        $data = json_decode($request->getContent(), true);
        $isRead = $data['read'] ?? true;
        
        $updated = $this->postService->setPostAsRead($post, $isRead);
        $postDTO = PostDTO::fromEntity($updated);
        
        $groups = $this->isGranted('ROLE_ADMIN') ? ['admin:read'] : ['post:read'];
        
        return $this->json([
            'success' => true,
            'data' => $postDTO,
            'message' => 'Post marked as ' . ($isRead ? 'read' : 'unread')
        ], 200, [], ['groups' => $groups]);
    }

    #[Route('/v1/posts/{id}', name: 'api_admin_post_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deletePost($id): JsonResponse
    {
        // Search for post by id; return 404 if not found
        $post = $this->postService->getPostById($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }

        // Delete post (service may handle soft-delete or additional validations)
        $this->postService->deletePost($post);
        return $this->json([
            'success' => true,
            'data' => null,
            'message' => 'Post deleted successfully'
        ], 204);
    }
}

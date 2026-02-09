<?php

namespace App\Controller\Api;

use App\Entity\Post;
use App\DTO\PostDTO;
use App\Repository\PostRepository;
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
    public function __construct(private PostService $postService)
    {
    }

    // Endpoints for public operations (no authentication required)

    #[Route('/v1/posts', name: 'api_post_get_all', methods: ['GET'])]
    public function getAllPosts(): JsonResponse
    {
        // List all active posts (pagination could be added here)
        $posts = $this->postService->getAllPosts();
        $postDtos = array_map(fn($post) => PostDTO::fromEntity($post), $posts);

        return $this->json([
            'success' => true,
            'data' => $postDtos,
            'message' => 'Posts retrieved successfully'
        ], 200, [], ['groups' => ['post:read']]);
    }

    #[Route('/v1/posts/{id}', name: 'api_post_get_by_id', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function getPostById(int $id): JsonResponse
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

        $postDto = PostDTO::fromEntity($post);
        return $this->json([
            'success' => true,
            'data' => $postDto,
            'message' => 'Post retrieved successfully'
        ], 200, [], ['groups' => ['post:read']]);
    }

    #[Route('/v1/users/{userId}/posts', name: 'api_user_posts', methods: ['GET'])]
    public function getPostsByUserId(int $userId): JsonResponse
    {
        // Get all posts by user ID
        $posts = $this->postService->getPostsByUserId($userId);
        $postDtos = array_map(fn($post) => PostDTO::fromEntity($post), $posts);

        return $this->json([
            'success' => true,
            'data' => $postDtos,
            'message' => 'User posts retrieved successfully'
        ], 200, [], ['groups' => ['post:read']]);
    }

    // Endpoints for operations with authenticated users

    #[Route('/v1/posts', name: 'api_post_create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function createPost(Request $request): JsonResponse
    {
        // Create a post from the received JSON
        $data = json_decode($request->getContent(), true);

        // Only override creatorId if user is not admin or it's not specified
        if (!$this->isGranted('ROLE_ADMIN') || !isset($data['creatorId'])) {
            $data['creatorId'] = $this->getUser()->getId();
        }

        $newPost = $this->postService->createPost($data);
        $postDto = PostDTO::fromEntity($newPost);
        return $this->json([
            'success' => true,
            'data' => $postDto,
            'message' => 'Post created successfully'
        ], 201, [], ['groups' => ['post:read']]);
    }

    #[Route('/v1/posts/{id}', name: 'api_post_update', methods: ['PUT'])]
    #[IsGranted('ROLE_USER')]
    public function updatePost(Request $request, int $id): JsonResponse
    {
        // Find post by id; return 404 if not found
        $post = $this->postService->getPostById($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }

        // Check authorization: only the post creator or admin can update
        $currentUser = $this->getUser();
        if (!$this->isGranted('ROLE_ADMIN') && $post->getCreator()->getId() !== $currentUser->getId()) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'You are not authorized to update this post'
            ], 403);
        }

        // Updates the Post entity with the body data
        $data = json_decode($request->getContent(), true);
        $updated = $this->postService->updatePost($post, $data);
        $postDto = PostDTO::fromEntity($updated);
        return $this->json([
            'success' => true,
            'data' => $postDto,
            'message' => 'Post updated successfully'
        ], 200, [], ['groups' => ['post:read']]);
    }

    #[Route('/v1/posts/{id}', name: 'api_post_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_USER')]
    public function deletePost(int $id): JsonResponse
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

        // Check authorization: only the post creator or admin can delete
        $currentUser = $this->getUser();
        if (!$this->isGranted('ROLE_ADMIN') && $post->getCreator()->getId() !== $currentUser->getId()) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'You are not authorized to delete this post'
            ], 403);
        }

        // Delete post (service may handle soft-delete or additional validations)
        $this->postService->deletePost($post);
        return $this->json([
            'success' => true,
            'data' => null,
            'message' => 'Post deleted successfully'
        ], 204);
    }

    // Endpoints for administration (requires ROLE_ADMIN)

    #[Route('/v1/admin/posts', name: 'api_admin_posts_list', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function listPosts(PostRepository $repo): JsonResponse
    {
        // List of all posts (pagination could be added here)
        $posts = $repo->findAll();
        $postDtos = array_map(fn($post) => PostDTO::fromEntity($post), $posts);
        return $this->json([
            'success' => true,
            'data' => $postDtos,
            'message' => 'Posts retrieved successfully'
        ], 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/posts/{id}', name: 'api_admin_posts_get', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function getAdminPostById(int $id, PostRepository $repo): JsonResponse
    {
        // Search for post by id; return 404 if not found
        $post = $repo->find($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }

        $postDto = PostDTO::fromEntity($post);
        return $this->json([
            'success' => true,
            'data' => $postDto,
            'message' => 'Post retrieved successfully'
        ], 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/post', name: 'api_admin_posts_create', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function createAdminPost(Request $request): JsonResponse
    {
        // Create a post from the received JSON
        $data = json_decode($request->getContent(), true);
        $newPost = $this->postService->createPost($data);
        $postDto = PostDTO::fromEntity($newPost);
        return $this->json([
            'success' => true,
            'data' => $postDto,
            'message' => 'Post created successfully'
        ], 201, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/post/{id}', name: 'api_admin_posts_update', methods: ['PUT'])]
    #[IsGranted('ROLE_ADMIN')]
    public function updateAdminPost(Request $request, int $id, PostRepository $repo): JsonResponse
    {
        // Find post by id; return 404 if not found
        $post = $repo->find($id);
        if (!$post) {
            return $this->json([
                'success' => false,
                'data' => null,
                'message' => 'Post not found'
            ], 404);
        }

        // Updates the Post entity with the body data
        $data = json_decode($request->getContent(), true);
        $updated = $this->postService->updatePost($post, $data);
        $postDto = PostDTO::fromEntity($updated);
        return $this->json([
            'success' => true,
            'data' => $postDto,
            'message' => 'Post updated successfully'
        ], 200, [], ['groups' => ['admin:read']]);
    }

    #[Route('/v1/admin/post/{id}', name: 'api_admin_posts_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteAdminPost(int $id, PostRepository $repo): JsonResponse
    {
        // Search for post by id; return 404 if not found
        $post = $repo->find($id);
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

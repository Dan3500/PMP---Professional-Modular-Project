<?php

namespace App\Service;

use App\Entity\Post;
use App\Entity\User;
use App\Repository\PostRepository;
use App\Repository\UserRepository;
use Symfony\Component\PasswordHasher\Hasher\PostPasswordHasherInterface;
use App\Exception\PostRegisteredException;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;

class PostService
{
    public function __construct(
        public PostRepository $postRepository,
        public UserRepository $userRepository,
    ) {}

    /**
     * Get Post by ID
     * @param int $id
     * @return Post|null
     */
    public function getPostById(int $id): ?Post
    {
        return $this->postRepository->find($id);
    }

    /**
     * Get Post by email
     * @param string $email
     * @return Post|null
     */
    public function getPostByEmail(string $email): ?Post
    {
        return $this->postRepository->findOneBy(['email' => $email]);
    }

    /**
     * Get Post by name
     * @param string $name
     * @return Post|null
     */
    public function getPostByName(string $name): ?Post
    {
        return $this->postRepository->findOneBy(['name' => $name]);
    }

    /**
     * Get all Posts
     * @return Post[]
     */
    public function getAllPosts(): array
    {
        return $this->postRepository->findAll();
    }

    public function createPost(array $data): Post
    {
        $post = new Post();
        
        if (isset($data['name'])) {
            $post->setName($data['name']);
        }
        
        if (isset($data['message'])) {
            $post->setMessage($data['message']);
        }
        
        if (isset($data['creatorId'])) {
            $creator = $this->userRepository->find($data['creatorId']);
            if ($creator) {
                $post->setCreator($creator);
            }
        }
        
        $post->setRead(false);
        $post->setActive(true);
        $post->setCreatedAt(new \DateTimeImmutable());
        $post->setUpdatedAt(new \DateTimeImmutable());
        
        $this->postRepository->save($post, true);

        return $post;
    }

    /**
     * Update Post details
     * @param Post $post
     * @param array $data
     * @return Post
     */
    public function updatePost(Post $post, array $data): Post
    {
        if (isset($data['name'])) {
            $post->setName($data['name']);
        }
        
        if (isset($data['message'])) {
            $post->setMessage($data['message']);
        }
        
        if (isset($data['read'])) {
            $post->setRead($data['read']);
        }
        
        if (isset($data['active'])) {
            $post->setActive($data['active']);
        }
        
        if (isset($data['creatorId'])) {
            $creator = $this->userRepository->find($data['creatorId']);
            if ($creator) {
                $post->setCreator($creator);
            }
        }

        $post->setUpdatedAt(new \DateTimeImmutable());
        $this->postRepository->save($post, true);

        return $post;
    }


    /**
     * Active/Deactivate Post
     * @param Post $post
     * @param array $data
     * @return Post
     */
    public function activePost(Post $post, array $data = []): Post
    {
        // Toggle active status
        $post->setActive(!$post->isActive());

        $post->setUpdatedAt(new \DateTimeImmutable());
        $this->postRepository->save($post, true);

        return $post;
    }

    /**
     * Mark Post as read/unread
     * @param Post $post
     * @param bool $isRead
     * @return Post
     */
    public function setPostAsRead(Post $post, bool $isRead): Post
    {
        $post->setRead($isRead);
        $post->setUpdatedAt(new \DateTimeImmutable());
        $this->postRepository->save($post, true);

        return $post;
    }

    /**
     * Delete a Post
     * @param Post $Post
     * @return void
     */
    public function deletePost(Post $Post): void
    {
        $this->postRepository->remove($Post, true);
    }
}

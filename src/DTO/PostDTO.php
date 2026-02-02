<?php

namespace App\DTO;

use App\Entity\Post;
use Symfony\Component\Serializer\Annotation\Groups;

class PostDTO
{
    #[Groups(['post:read', 'admin:read'])]
    public int $id;

    #[Groups(['post:read', 'admin:read'])]
    public string $name;

    #[Groups(['post:read', 'admin:read'])]
    public string $message;

    #[Groups(['post:read', 'admin:read'])]
    public bool $read;

    #[Groups(['post:read', 'admin:read'])]
    public bool $active;

    #[Groups(['post:read', 'admin:read'])]
    public string $createdAt;

    #[Groups(['post:read', 'admin:read'])]
    public string $updatedAt;

    #[Groups(['post:read', 'admin:read'])]
    public array $creator;

    public static function fromEntity(Post $post): self
    {
        $dto = new self();
        $dto->id = $post->getId();
        $dto->name = $post->getName() ?? 'Untitled';
        $dto->message = $post->getMessage() ?? '';
        $dto->read = $post->isRead() ?? false;
        $dto->active = $post->isActive() ?? false;
        
        // Format dates with Europe/Madrid timezone
        $madridTz = new \DateTimeZone('Europe/Madrid');
        if ($post->getCreatedAt()) {
            $createdDate = $post->getCreatedAt()->setTimezone($madridTz);
            $dto->createdAt = $createdDate->format('Y-m-d H:i:s');
        } else {
            $dto->createdAt = (new \DateTime('now', $madridTz))->format('Y-m-d H:i:s');
        }
        
        if ($post->getUpdatedAt()) {
            $updatedDate = $post->getUpdatedAt()->setTimezone($madridTz);
            $dto->updatedAt = $updatedDate->format('Y-m-d H:i:s');
        } else {
            $dto->updatedAt = (new \DateTime('now', $madridTz))->format('Y-m-d H:i:s');
        }
        
        $creator = $post->getCreator();
        if ($creator) {
            $dto->creator = [
                'id' => $creator->getId(),
                'name' => $creator->getName(),
                'email' => $creator->getEmail(),
            ];
        } else {
            $dto->creator = [
                'id' => null,
                'name' => 'Unknown',
                'email' => 'N/A',
            ];
        }
        
        return $dto;
    }
}

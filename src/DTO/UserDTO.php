<?php

namespace App\DTO;

use App\Entity\User;
use Symfony\Component\Serializer\Annotation\Groups;

class UserDTO

{#[Groups(['admin:read'])]
    public string $id;

    #[Groups(['user:read', 'admin:read'])]
    public string $name;

    #[Groups(['user:read', 'admin:read'])]
    public string $email;

    #[Groups(['user:read', 'admin:read'])]
    public array $roles;

    #[Groups(['user:read', 'admin:read'])]
    public string $createdAt;

    #[Groups(['admin:read'])]
    public string $updatedAt;

    #[Groups(['admin:read'])]
    public bool $isActive;

    public static function fromEntity(User $user): self
    {
        $dto = new self();
        $dto->id = $user->getId();
        $dto->email = $user->getEmail();
        $dto->name = $user->getName();
        $dto->roles = $user->getRole();
        $dto->createdAt = $user->getCreatedAt()->format('Y-m-d H:i:s');
        $dto->updatedAt = $user->getUpdatedAt()->format('Y-m-d H:i:s');
        return $dto;
    }
}

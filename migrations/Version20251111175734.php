<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251111175734 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE "user" ADD is_active BOOLEAN DEFAULT false NOT NULL');
        $this->addSql('ALTER TABLE "user" ALTER COLUMN role TYPE JSON USING role::json');
        $this->addSql('ALTER TABLE "user" ALTER COLUMN role SET DEFAULT \'[]\'');
        $this->addSql('COMMENT ON COLUMN "user".role IS NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE "user" DROP is_active');
        $this->addSql('ALTER TABLE "user" ALTER role TYPE TEXT');
        $this->addSql('ALTER TABLE "user" ALTER role DROP DEFAULT');
        $this->addSql('COMMENT ON COLUMN "user".role IS \'(DC2Type:array)\'');
    }
}

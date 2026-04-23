<?php

namespace App\Models;

use Exception;

class Skill extends BaseModel
{
    protected string $table = 'skills';

    /**
     * Add a skill to a user
     */
    public function addSkill(string $userId, array $skillData): string
    {
        $required = ['name'];
        foreach ($required as $field) {
            if (!isset($skillData[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $data = [
            'user_id' => $userId,
            'name' => $skillData['name'],
            'category' => $skillData['category'] ?? 'technical',
            'proficiency' => $skillData['proficiency'] ?? 50
        ];

        return $this->create($data);
    }

    /**
     * Get skills by user
     */
    public function getByUser(string $userId): array
    {
        return $this->findBy(['user_id' => $userId]);
    }

    /**
     * Get skills by category
     */
    public function getByCategory(string $category): array
    {
        return $this->findBy(['category' => $category]);
    }

    /**
     * Update skill proficiency
     */
    public function updateProficiency(string $skillId, int $proficiency): bool
    {
        if ($proficiency < 1 || $proficiency > 100) {
            throw new Exception("Proficiency must be between 1 and 100");
        }
        return $this->update($skillId, ['proficiency' => $proficiency]);
    }

    /**
     * Get skills matching job requirements
     */
    public function getMatchingSkills(string $userId, array $requiredSkills): array
    {
        $placeholders = implode(',', array_fill(0, count($requiredSkills), '?'));
        $sql = "SELECT * FROM {$this->table} 
                WHERE user_id = ? AND name IN ($placeholders)";
        
        $params = [$userId, ...$requiredSkills];
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}

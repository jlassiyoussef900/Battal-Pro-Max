<?php

namespace App\Models;

class WorkExperience extends BaseModel
{
    protected string $table = 'work_experience';

    /**
     * Add work experience for a user
     */
    public function addExperience(string $userId, array $experienceData): string
    {
        $required = ['company', 'position'];
        foreach ($required as $field) {
            if (!isset($experienceData[$field])) {
                throw new \Exception("Missing required field: $field");
            }
        }

        $data = [
            'user_id' => $userId,
            'company' => $experienceData['company'],
            'position' => $experienceData['position'],
            'location' => $experienceData['location'] ?? null,
            'start_date' => $experienceData['start_date'] ?? null,
            'end_date' => $experienceData['end_date'] ?? null,
            'current' => $experienceData['current'] ?? false,
            'description' => $experienceData['description'] ?? null,
            'achievements' => isset($experienceData['achievements']) ? '{' . implode(',', $experienceData['achievements']) . '}' : null
        ];

        return $this->create($data);
    }

    /**
     * Get work experience by user
     */
    public function getByUser(string $userId): array
    {
        return $this->getAll(['user_id' => $userId], ['start_date DESC']);
    }

    /**
     * Get current position
     */
    public function getCurrentPosition(string $userId): ?array
    {
        return $this->findOneBy(['user_id' => $userId, 'current' => true]);
    }

    /**
     * Update experience
     */
    public function updateExperience(string $id, array $data): bool
    {
        if (isset($data['achievements']) && is_array($data['achievements'])) {
            $data['achievements'] = '{' . implode(',', $data['achievements']) . '}';
        }
        return $this->update($id, $data);
    }
}

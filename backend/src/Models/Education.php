<?php

namespace App\Models;

class Education extends BaseModel
{
    protected string $table = 'education';

    /**
     * Add education record
     */
    public function addEducation(string $userId, array $educationData): string
    {
        $required = ['institution', 'degree'];
        foreach ($required as $field) {
            if (!isset($educationData[$field])) {
                throw new \Exception("Missing required field: $field");
            }
        }

        $data = [
            'user_id' => $userId,
            'institution' => $educationData['institution'],
            'degree' => $educationData['degree'],
            'field_of_study' => $educationData['field_of_study'] ?? null,
            'start_date' => $educationData['start_date'] ?? null,
            'end_date' => $educationData['end_date'] ?? null,
            'current' => $educationData['current'] ?? false,
            'gpa' => $educationData['gpa'] ?? null
        ];

        return $this->create($data);
    }

    /**
     * Get education by user
     */
    public function getByUser(string $userId): array
    {
        return $this->getAll(['user_id' => $userId], ['start_date DESC']);
    }

    /**
     * Get highest education level
     */
    public function getHighestEducation(string $userId): ?array
    {
        $results = $this->getByUser($userId);
        return $results[0] ?? null;
    }
}

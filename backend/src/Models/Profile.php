<?php

namespace App\Models;

use Exception;

class Profile extends BaseModel
{
    protected string $table = 'profiles';

    /**
     * Create a new profile
     */
    public function createProfile(array $profileData): string
    {
        if (!isset($profileData['user_id'])) {
            throw new Exception("Missing required field: user_id");
        }

        $data = [
            'user_id' => $profileData['user_id'],
            'headline' => $profileData['headline'] ?? null,
            'summary' => $profileData['summary'] ?? null,
            'phone' => $profileData['phone'] ?? null,
            'linkedin' => $profileData['linkedin'] ?? null,
            'portfolio' => $profileData['portfolio'] ?? null,
            'city' => $profileData['city'] ?? null,
            'region' => $profileData['region'] ?? null,
            'country' => $profileData['country'] ?? null,
            'remote' => isset($profileData['remote']) ? (bool)$profileData['remote'] : false,
            'salary_min' => $profileData['salary_min'] ?? null,
            'salary_max' => $profileData['salary_max'] ?? null,
            'salary_currency' => $profileData['salary_currency'] ?? 'USD',
            'job_types' => isset($profileData['job_types']) ? '{' . implode(',', $profileData['job_types']) . '}' : null,
            'industries' => isset($profileData['industries']) ? '{' . implode(',', $profileData['industries']) . '}' : null,
            'company_sizes' => isset($profileData['company_sizes']) ? '{' . implode(',', $profileData['company_sizes']) . '}' : null
        ];

        return $this->create($data);
    }

    /**
     * Get profile by user ID
     */
    public function getByUserId(string $userId): ?array
    {
        return $this->findOneBy(['user_id' => $userId]);
    }

    /**
     * Update profile
     */
    public function updateProfile(string $profileId, array $data): bool
    {
        // Handle array fields
        if (isset($data['job_types']) && is_array($data['job_types'])) {
            $data['job_types'] = '{' . implode(',', $data['job_types']) . '}';
        }
        if (isset($data['industries']) && is_array($data['industries'])) {
            $data['industries'] = '{' . implode(',', $data['industries']) . '}';
        }
        if (isset($data['company_sizes']) && is_array($data['company_sizes'])) {
            $data['company_sizes'] = '{' . implode(',', $data['company_sizes']) . '}';
        }

        return $this->update($profileId, $data);
    }

    /**
     * Get user profile by user ID
     */
    public function getUserProfile(string $userId): ?array
    {
        $sql = "SELECT p.*, u.email, u.first_name, u.last_name, u.avatar_url, u.role
                FROM {$this->table} p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.user_id = ?";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);

        return $stmt->fetch(\PDO::FETCH_ASSOC) ?: null;
    }

    /**
     * Search profiles by location
     */
    public function searchByLocation(string $city, string $country): array
    {
        $sql = "SELECT * FROM {$this->table} 
                WHERE city = ? AND country = ?
                ORDER BY updated_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$city, $country]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get remote workers
     */
    public function getRemoteWorkers(): array
    {
        return $this->findBy(['remote' => true]);
    }

    /**
     * Update salary expectations
     */
    public function updateSalaryExpectations(string $profileId, int $min, int $max, string $currency = 'USD'): bool
    {
        return $this->update($profileId, [
            'salary_min' => $min,
            'salary_max' => $max,
            'salary_currency' => $currency
        ]);
    }

    /**
     * Update job preferences
     */
    public function updateJobPreferences(string $profileId, array $jobTypes, array $industries, array $companySizes): bool
    {
        return $this->update($profileId, [
            'job_types' => '{' . implode(',', $jobTypes) . '}',
            'industries' => '{' . implode(',', $industries) . '}',
            'company_sizes' => '{' . implode(',', $companySizes) . '}'
        ]);
    }
}

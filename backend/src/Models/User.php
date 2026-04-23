<?php

namespace App\Models;

use Exception;

class User extends BaseModel
{
    protected string $table = 'users';

    /**
     * Create a new user
     */
    public function register(array $userData): string
    {
        // Validate required fields
        $required = ['email', 'password', 'first_name', 'last_name'];
        foreach ($required as $field) {
            if (!isset($userData[$field])) {
                throw new Exception("Missing required field: $field");
            }
        }

        $data = [
            'email' => $userData['email'],
            'password_hash' => password_hash($userData['password'], PASSWORD_BCRYPT),
            'first_name' => $userData['first_name'],
            'last_name' => $userData['last_name'],
            'role' => $userData['role'] ?? 'jobseeker',
            'avatar_url' => $userData['avatar_url'] ?? null
        ];

        // Create user
        $userId = $this->create($data);
        
        // Create role-specific profile
        $this->createRoleProfile($userId, $data['role'], $userData);
        
        return $userId;
    }

    /**
     * Create role-specific profile
     */
    private function createRoleProfile(string $userId, string $role, array $userData): void
    {
        $query = null;
        $params = [$userId];
        
        if ($role === 'jobseeker') {
            $query = "
                INSERT INTO job_seekers (
                    user_id, headline, availability
                ) VALUES (?, ?, 'immediately')
            ";
            $headline = $userData['first_name'] . ' ' . $userData['last_name'] . ' - Job Seeker';
            $params[] = $headline;
        } 
        else if ($role === 'recruiter') {
            $query = "
                INSERT INTO recruiters (
                    user_id, headline
                ) VALUES (?, ?)
            ";
            $headline = $userData['first_name'] . ' ' . $userData['last_name'] . ' - Recruiter';
            $params[] = $headline;
        } 
        else if ($role === 'company_admin') {
            // For company admin, create a default entry
            $query = "
                INSERT INTO job_seekers (
                    user_id, headline, availability
                ) VALUES (?, ?, 'immediately')
            ";
            $headline = $userData['first_name'] . ' ' . $userData['last_name'] . ' - Company Admin';
            $params[] = $headline;
        }

        if ($query) {
            try {
                $stmt = $this->db->prepare($query);
                $stmt->execute($params);
            } catch (Exception $e) {
                // Silently fail if role profile creation fails
                // User was already created successfully
            }
        }
    }

    /**
     * Get user by email
     */
    public function getByEmail(string $email): ?array
    {
        return $this->findOneBy(['email' => $email]);
    }

    /**
     * Authenticate user
     */
    public function authenticate(string $email, string $password): ?array
    {
        $user = $this->getByEmail($email);
        
        if (!$user) {
            return null;
        }

        if (password_verify($password, $user['password_hash'])) {
            // Remove password hash from returned data
            unset($user['password_hash']);
            return $user;
        }

        return null;
    }

    /**
     * Update user
     */
    public function updateUser(string $id, array $data): bool
    {
        // Don't allow direct password update through this method
        unset($data['password_hash']);

        return $this->update($id, $data);
    }

    /**
     * Change password
     */
    public function changePassword(string $id, string $newPassword): bool
    {
        return $this->update($id, [
            'password_hash' => password_hash($newPassword, PASSWORD_BCRYPT)
        ]);
    }

    /**
     * Get users by role
     */
    public function getByRole(string $role): array
    {
        return $this->findBy(['role' => $role]);
    }

    /**
     * Get user with role filtering to exclude password
     */
    public function getUserPublicInfo(string $id): ?array
    {
        $user = $this->getById($id);
        if ($user) {
            unset($user['password_hash']);
        }
        return $user;
    }
}

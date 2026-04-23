<?php

namespace App\Models;

class JobMatch extends BaseModel
{
    protected string $table = 'matches';

    /**
     * Create a match (Tinder-style like/pass)
     */
    public function createMatch(string $jobSeekerId, string $jobId, string $action, ?int $score = null): string
    {
        if (!in_array($action, ['like', 'pass', 'maybe'])) {
            throw new \Exception("Invalid action. Must be 'like', 'pass', or 'maybe'");
        }

        $data = [
            'jobseeker_id' => $jobSeekerId,
            'job_id' => $jobId,
            'action' => $action,
            'score' => $score ?? null
        ];

        return $this->create($data);
    }

    /**
     * Get matches for a job seeker
     */
    public function getByJobSeeker(string $jobSeekerId): array
    {
        return $this->getAll(['jobseeker_id' => $jobSeekerId], ['created_at DESC']);
    }

    /**
     * Get liked jobs
     */
    public function getLikedJobs(string $jobSeekerId): array
    {
        return $this->findBy(['jobseeker_id' => $jobSeekerId, 'action' => 'like']);
    }

    /**
     * Get passed jobs
     */
    public function getPassedJobs(string $jobSeekerId): array
    {
        return $this->findBy(['jobseeker_id' => $jobSeekerId, 'action' => 'pass']);
    }

    /**
     * Check if already matched
     */
    public function hasMatched(string $jobSeekerId, string $jobId): bool
    {
        $result = $this->findOneBy(['jobseeker_id' => $jobSeekerId, 'job_id' => $jobId]);
        return $result !== null;
    }

    /**
     * Get mutual matches (job seeker liked + company interested)
     */
    public function getMutualMatches(string $jobSeekerId): array
    {
        $sql = "SELECT m.*, j.title, j.company_id, c.name as company_name
                FROM {$this->table} m
                JOIN jobs j ON m.job_id = j.id
                JOIN companies c ON j.company_id = c.id
                WHERE m.jobseeker_id = ? AND m.action = 'like'
                ORDER BY m.created_at DESC";
        
        $stmt = $this->db->prepare($sql);
        $stmt->execute([$jobSeekerId]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Calculate match score
     */
    public function calculateMatchScore(string $jobSeekerId, string $jobId): int
    {
        // This will be enhanced with actual matching algorithm
        // For now, return a basic score
        return rand(60, 99);
    }
}

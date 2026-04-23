<?php

namespace App\Models;

use PDO;
use Exception;

class JobSeekerDashboard extends BaseModel
{
    protected string $table = 'profiles';

    // ── Full Profile ───────────────────────────────────────────────────────────

    public function getFullProfile(string $userId): ?array
    {
        $stmt = $this->db->prepare("
            SELECT p.*, u.email, u.first_name, u.last_name, u.avatar_url, u.role, u.created_at as member_since
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE p.user_id = ?
        ");
        $stmt->execute([$userId]);
        $profile = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$profile) return null;

        // Parse PostgreSQL arrays
        foreach (['job_types', 'industries', 'company_sizes'] as $field) {
            $profile[$field] = $this->parsePostgresArray($profile[$field] ?? null);
        }

        // Attach related data
        $profile['skills']      = $this->getSkills($userId);
        $profile['experience']  = $this->getExperience($userId);
        $profile['education']   = $this->getEducation($userId);
        $profile['badges']      = $this->getBadges($userId);
        $profile['certifications'] = $this->getCertifications($userId);

        return $profile;
    }

    public function upsertProfile(string $userId, array $data): bool
    {
        $existing = $this->findOneBy(['user_id' => $userId]);

        $fields = [
            'headline', 'summary', 'phone', 'linkedin', 'portfolio',
            'city', 'region', 'country', 'remote',
            'salary_min', 'salary_max', 'salary_currency',
        ];

        $mapped = ['user_id' => $userId];
        foreach ($fields as $f) {
            if (array_key_exists($f, $data)) $mapped[$f] = $data[$f];
        }

        foreach (['job_types', 'industries', 'company_sizes'] as $f) {
            if (isset($data[$f]) && is_array($data[$f])) {
                $mapped[$f] = '{' . implode(',', $data[$f]) . '}';
            }
        }

        if ($existing) {
            unset($mapped['user_id']);
            return $this->update($existing['id'], $mapped);
        }

        $this->create($mapped);
        return true;
    }

    // ── Skills ─────────────────────────────────────────────────────────────────

    private function getSkills(string $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM skills WHERE user_id = ? ORDER BY proficiency DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Experience ─────────────────────────────────────────────────────────────

    private function getExperience(string $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM work_experience WHERE user_id = ? ORDER BY start_date DESC");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map(function ($r) {
            $r['achievements'] = $this->parsePostgresArray($r['achievements'] ?? null);
            return $r;
        }, $rows);
    }

    // ── Education ──────────────────────────────────────────────────────────────

    private function getEducation(string $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM education WHERE user_id = ? ORDER BY start_date DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Badges ─────────────────────────────────────────────────────────────────

    private function getBadges(string $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM badges WHERE user_id = ? ORDER BY earned_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Certifications ─────────────────────────────────────────────────────────

    private function getCertifications(string $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM certifications WHERE user_id = ? ORDER BY issue_date DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Statistics ─────────────────────────────────────────────────────────────

    public function getStatistics(string $userId): array
    {
        $db = $this->db;

        // Application counts by status
        $stmt = $db->prepare("
            SELECT status, COUNT(*) as count
            FROM applications WHERE user_id = ?
            GROUP BY status
        ");
        $stmt->execute([$userId]);
        $appRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $appByStatus = [];
        foreach ($appRows as $r) $appByStatus[$r['status']] = (int)$r['count'];

        $totalApps = array_sum($appByStatus);

        // Swipe stats
        $stmt = $db->prepare("
            SELECT action, COUNT(*) as count FROM matches WHERE jobseeker_id = ? GROUP BY action
        ");
        $stmt->execute([$userId]);
        $swipeRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $swipes = [];
        foreach ($swipeRows as $r) $swipes[$r['action']] = (int)$r['count'];

        // Badge stats
        $stmt = $db->prepare("
            SELECT level, COUNT(*) as count, AVG(score) as avg_score
            FROM badges WHERE user_id = ? GROUP BY level
        ");
        $stmt->execute([$userId]);
        $badgeRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $badgesByLevel = [];
        foreach ($badgeRows as $r) {
            $badgesByLevel[$r['level']] = ['count' => (int)$r['count'], 'avg_score' => round((float)$r['avg_score'], 1)];
        }

        // Profile views (from profile_views table)
        $stmt = $db->prepare("SELECT COUNT(*) as count FROM profile_views WHERE profile_user_id = ?");
        $stmt->execute([$userId]);
        $profileViews = (int)$stmt->fetch(PDO::FETCH_ASSOC)['count'];

        // Applications over time (last 6 months)
        $stmt = $db->prepare("
            SELECT TO_CHAR(DATE_TRUNC('month', applied_at), 'YYYY-MM') as month, COUNT(*) as count
            FROM applications WHERE user_id = ? AND applied_at >= NOW() - INTERVAL '6 months'
            GROUP BY month ORDER BY month ASC
        ");
        $stmt->execute([$userId]);
        $appTrend = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Top matched industries
        $stmt = $db->prepare("
            SELECT j.industry, COUNT(*) as count
            FROM matches m
            JOIN jobs j ON m.job_id = j.id
            WHERE m.jobseeker_id = ? AND m.action = 'like'
            GROUP BY j.industry ORDER BY count DESC LIMIT 5
        ");
        $stmt->execute([$userId]);
        $topIndustries = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'applications' => [
                'total'       => $totalApps,
                'by_status'   => $appByStatus,
                'trend'       => $appTrend,
            ],
            'swipes' => [
                'liked'  => $swipes['like']  ?? 0,
                'passed' => $swipes['pass']  ?? 0,
                'maybe'  => $swipes['maybe'] ?? 0,
            ],
            'badges' => [
                'total'     => array_sum(array_column($badgeRows, 'count')),
                'by_level'  => $badgesByLevel,
            ],
            'profileViews'  => $profileViews,
            'topIndustries' => $topIndustries,
        ];
    }

    // ── Job Recommendations with real match scoring ────────────────────────────

    public function getRecommendations(string $userId, int $limit = 20): array
    {
        $profile = $this->getFullProfile($userId);
        if (!$profile) return [];

        $userSkills = array_map(fn($s) => strtolower($s['name']), $profile['skills']);

        // Total years of experience
        $totalYears = 0;
        foreach ($profile['experience'] as $exp) {
            $start = strtotime($exp['start_date'] ?? 'now');
            $end   = $exp['current'] ? time() : strtotime($exp['end_date'] ?? 'now');
            $totalYears += max(0, ($end - $start) / (365.25 * 24 * 3600));
        }

        // Get already swiped job IDs
        $stmt = $this->db->prepare("SELECT job_id FROM matches WHERE jobseeker_id = ?");
        $stmt->execute([$userId]);
        $swipedIds = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Fetch active jobs not yet swiped
        $excludePlaceholders = !empty($swipedIds)
            ? 'AND j.id NOT IN (' . implode(',', array_fill(0, count($swipedIds), '?')) . ')'
            : '';

        $sql = "
            SELECT j.*, c.name as company_name, c.logo_url
            FROM jobs j
            JOIN companies c ON j.company_id = c.id
            WHERE j.status = 'active' $excludePlaceholders
            ORDER BY j.posted_at DESC
            LIMIT ?
        ";

        $params = array_merge($swipedIds, [$limit * 3]); // fetch more to score & sort
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        $jobs = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Score each job
        $scored = array_map(function ($job) use ($userSkills, $totalYears, $profile) {
            $job['skills'] = $this->parsePostgresArray($job['skills'] ?? null);
            $score = $this->scoreJob($job, $userSkills, $totalYears, $profile);
            $job['compatibility_score'] = $score;
            return $job;
        }, $jobs);

        // Sort by score descending, return top $limit
        usort($scored, fn($a, $b) => $b['compatibility_score'] <=> $a['compatibility_score']);
        return array_slice($scored, 0, $limit);
    }

    private function scoreJob(array $job, array $userSkills, float $totalYears, array $profile): int
    {
        // Skills match (40%)
        $jobSkills = array_map('strtolower', $job['skills']);
        $matched = count(array_intersect($userSkills, $jobSkills));
        $skillScore = $jobSkills ? min(100, round(($matched / count($jobSkills)) * 100)) : 50;

        // Experience level match (25%)
        $expMap = ['entry' => 1, 'mid' => 3, 'senior' => 6, 'executive' => 10];
        $required = $expMap[$job['experience_level'] ?? 'mid'] ?? 3;
        $expScore = min(100, round(($totalYears / $required) * 100));

        // Salary match (15%)
        $salaryScore = 50;
        if ($job['salary_max'] && $profile['salary_min']) {
            $salaryScore = $job['salary_max'] >= $profile['salary_min'] ? 100 : 30;
        }

        // Location / remote match (10%)
        $locationScore = 50;
        if ($job['remote'] && $profile['remote']) {
            $locationScore = 100;
        } elseif (strtolower($job['city'] ?? '') === strtolower($profile['city'] ?? '')) {
            $locationScore = 100;
        }

        // Industry match (10%)
        $industries = $this->parsePostgresArray($profile['industries'] ?? null);
        $industryScore = in_array($job['industry'], $industries) ? 100 : 50;

        return (int)round(
            ($skillScore * 0.40) +
            ($expScore   * 0.25) +
            ($salaryScore * 0.15) +
            ($locationScore * 0.10) +
            ($industryScore * 0.10)
        );
    }

    // ── Applications ───────────────────────────────────────────────────────────

    public function getApplications(string $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT a.*, j.title as job_title, j.company_id, j.job_type, j.experience_level,
                   j.salary_min, j.salary_max, j.salary_currency,
                   c.name as company_name, c.logo_url
            FROM applications a
            JOIN jobs j ON a.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            WHERE a.user_id = ?
            ORDER BY a.applied_at DESC
        ");
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ── Notifications ──────────────────────────────────────────────────────────

    public function getNotifications(string $userId, bool $unreadOnly = false): array
    {
        $sql = "SELECT * FROM notifications WHERE user_id = ?";
        if ($unreadOnly) $sql .= " AND read = false";
        $sql .= " ORDER BY created_at DESC LIMIT 50";

        $stmt = $this->db->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function markNotificationRead(string $notificationId, string $userId): bool
    {
        $stmt = $this->db->prepare("UPDATE notifications SET read = true WHERE id = ? AND user_id = ?");
        return $stmt->execute([$notificationId, $userId]);
    }

    public function markAllNotificationsRead(string $userId): bool
    {
        $stmt = $this->db->prepare("UPDATE notifications SET read = true WHERE user_id = ?");
        return $stmt->execute([$userId]);
    }

    public function createNotification(string $userId, string $type, string $title, string $message, array $data = []): string
    {
        $stmt = $this->db->prepare("
            INSERT INTO notifications (user_id, type, title, message, data, read, created_at)
            VALUES (?, ?, ?, ?, ?, false, NOW())
            RETURNING id
        ");
        $stmt->execute([$userId, $type, $title, $message, json_encode($data)]);
        return $stmt->fetch(PDO::FETCH_ASSOC)['id'];
    }

    // ── Profile Views tracking ─────────────────────────────────────────────────

    public function recordProfileView(string $profileUserId, ?string $viewerUserId): void
    {
        $stmt = $this->db->prepare("
            INSERT INTO profile_views (profile_user_id, viewer_user_id, viewed_at)
            VALUES (?, ?, NOW())
        ");
        $stmt->execute([$profileUserId, $viewerUserId]);
    }

    // ── Liked Jobs (with full job + company data) ──────────────────────────────

    public function getLikedJobs(string $userId): array
    {
        $stmt = $this->db->prepare("
            SELECT m.id as match_id, m.created_at as liked_at, m.score as match_score,
                   j.*, c.name as company_name, c.logo_url, c.industry as company_industry,
                   a.id as application_id, a.status as application_status
            FROM matches m
            JOIN jobs j ON m.job_id = j.id
            JOIN companies c ON j.company_id = c.id
            LEFT JOIN applications a ON a.job_id = j.id AND a.user_id = m.jobseeker_id
            WHERE m.jobseeker_id = ? AND m.action = 'like'
            ORDER BY m.created_at DESC
        ");
        $stmt->execute([$userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($r) {
            $r['skills'] = $this->parsePostgresArray($r['skills'] ?? null);
            $r['requirements'] = $this->parsePostgresArray($r['requirements'] ?? null);
            return $r;
        }, $rows);
    }

    // ── Profile completion score ───────────────────────────────────────────────

    public function getProfileCompletion(string $userId): array
    {
        $profile = $this->findOneBy(['user_id' => $userId]);
        $skills  = $this->getSkills($userId);
        $exp     = $this->getExperience($userId);
        $edu     = $this->getEducation($userId);
        $certs   = $this->getCertifications($userId);

        $checks = [
            'personal_info'  => !empty($profile['headline']) && !empty($profile['city']),
            'summary'        => !empty($profile['summary']),
            'work_experience'=> count($exp) > 0,
            'education'      => count($edu) > 0,
            'skills'         => count($skills) >= 3,
            'salary'         => !empty($profile['salary_min']),
            'certifications' => count($certs) > 0,
            'portfolio'      => !empty($profile['portfolio']),
        ];

        $completed = count(array_filter($checks));
        $total     = count($checks);

        return [
            'percentage' => (int)round(($completed / $total) * 100),
            'checks'     => $checks,
            'completed'  => $completed,
            'total'      => $total,
        ];
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private function parsePostgresArray(?string $pgArray): array
    {
        if (empty($pgArray)) return [];
        $pgArray = trim($pgArray, '{}');
        if (empty($pgArray)) return [];
        return array_map(fn($i) => trim($i, '" '), explode(',', $pgArray));
    }
}

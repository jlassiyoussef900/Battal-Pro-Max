<?php

namespace App;

use Exception;

class ApiRouter
{
    private array $routes = [];
    private string $method;
    private string $path;
    private array $pathParams = [];

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->path = $this->parsePath($_SERVER['REQUEST_URI']);
        $this->setupRoutes();
    }

    /**
     * Parse and normalize the request path
     */
    private function parsePath(string $uri): string
    {
        // Extract just the path part (remove query string)
        $path = parse_url($uri, PHP_URL_PATH);
        
        // Remove /backend/public prefix if it exists (when running from project root)
        $path = preg_replace('#^/backend/public#', '', $path);
        $path = preg_replace('#^/public#', '', $path);
        
        // Normalize: trim slashes and convert to lowercase
        return strtolower(trim($path, '/'));
    }

    /**
     * Register all API routes
     */
    private function setupRoutes(): void
    {
        // Auth Routes
        $this->post('auth/register', [$this, 'register']);
        $this->post('auth/login', [$this, 'login']);

        // User Routes
        $this->get('users/{id}', [$this, 'getUser']);
        $this->put('users/{id}', [$this, 'updateUser']);
        $this->delete('users/{id}', [$this, 'deleteUser']);
        $this->get('users/{id}/public', [$this, 'getUserPublicInfo']);

        // Profile Routes
        $this->get('profiles/{userId}', [$this, 'getProfile']);
        $this->post('profiles', [$this, 'createProfile']);
        $this->put('profiles/{id}', [$this, 'updateProfile']);
        $this->get('profiles/{userId}/full', [$this, 'getFullProfile']);

        // Job Routes
        $this->get('jobs', [$this, 'getJobs']);
        $this->get('jobs/{id}', [$this, 'getJob']);
        $this->post('jobs', [$this, 'createJob']);
        $this->put('jobs/{id}', [$this, 'updateJob']);
        $this->delete('jobs/{id}', [$this, 'deleteJob']);
        $this->get('jobs/search/{query}', [$this, 'searchJobs']);
        $this->post('jobs/{id}/close', [$this, 'closeJob']);

        // Company Routes
        $this->get('companies', [$this, 'getCompanies']);
        $this->get('companies/{id}', [$this, 'getCompany']);
        $this->post('companies', [$this, 'createCompany']);
        $this->put('companies/{id}', [$this, 'updateCompany']);
        $this->delete('companies/{id}', [$this, 'deleteCompany']);
        $this->get('companies/search/{query}', [$this, 'searchCompanies']);

        // Skills Routes
        $this->post('skills', [$this, 'addSkill']);
        $this->get('users/{userId}/skills', [$this, 'getUserSkills']);
        $this->put('skills/{id}', [$this, 'updateSkill']);
        $this->delete('skills/{id}', [$this, 'deleteSkill']);

        // Work Experience Routes
        $this->post('experience', [$this, 'addExperience']);
        $this->get('users/{userId}/experience', [$this, 'getUserExperience']);
        $this->put('experience/{id}', [$this, 'updateExperience']);
        $this->delete('experience/{id}', [$this, 'deleteExperience']);

        // Education Routes
        $this->post('education', [$this, 'addEducation']);
        $this->get('users/{userId}/education', [$this, 'getUserEducation']);
        $this->put('education/{id}', [$this, 'updateEducation']);
        $this->delete('education/{id}', [$this, 'deleteEducation']);

        // Badge Routes
        $this->get('users/{userId}/badges', [$this, 'getUserBadges']);
        $this->post('badges', [$this, 'awardBadge']);
        $this->get('users/{userId}/badges/stats', [$this, 'getBadgeStats']);

        // Job Matching Routes (Tinder-style)
        $this->post('matches', [$this, 'createMatch']);
        $this->get('users/{userId}/matches', [$this, 'getUserMatches']);
        $this->get('users/{userId}/matches/liked', [$this, 'getLikedJobs']);
        $this->get('users/{userId}/matches/mutual', [$this, 'getMutualMatches']);

        // Recommendation Routes
        $this->get('users/{userId}/recommendations', [$this, 'getJobRecommendations']);

        // JobSeeker Dashboard Routes
        $this->get('users/{userId}/dashboard', [$this, 'getJobSeekerDashboard']);
        $this->get('users/{userId}/profile/full', [$this, 'getJobSeekerFullProfile']);
        $this->put('users/{userId}/profile', [$this, 'upsertJobSeekerProfile']);
        $this->get('users/{userId}/profile/completion', [$this, 'getProfileCompletion']);
        $this->get('users/{userId}/statistics', [$this, 'getJobSeekerStatistics']);
        $this->get('users/{userId}/liked-jobs', [$this, 'getLikedJobs']);
        $this->get('users/{userId}/notifications', [$this, 'getNotifications']);
        $this->put('notifications/{notificationId}/read', [$this, 'markNotificationRead']);
        $this->put('users/{userId}/notifications/read-all', [$this, 'markAllNotificationsRead']);
        $this->post('users/{userId}/profile/view', [$this, 'recordProfileView']);

        // Application Routes
        $this->post('applications', [$this, 'createApplication']);
        $this->get('users/{userId}/applications', [$this, 'getUserApplications']);
        $this->get('applications/{id}', [$this, 'getApplication']);
        $this->put('applications/{id}/status', [$this, 'updateApplicationStatus']);

        // Company Dashboard Routes
        $this->get('companies/{companyId}/metrics', [$this, 'getCompanyMetrics']);
        $this->get('companies/{companyId}/analytics', [$this, 'getCompanyAnalytics']);
        $this->get('companies/{companyId}/candidates', [$this, 'getCompanyCandidates']);
        $this->get('companies/{companyId}/jobs/full', [$this, 'getCompanyJobsFull']);
        $this->put('candidates/{applicationId}/status', [$this, 'updateCandidateStatus']);
        $this->get('candidates/{applicationId}/detail', [$this, 'getCandidateDetail']);
        $this->get('companies/{companyId}/members', [$this, 'getCompanyMembers']);
        $this->post('companies/{companyId}/members', [$this, 'addCompanyMember']);
        $this->delete('companies/{companyId}/members/{userId}', [$this, 'removeCompanyMember']);
    }

    /**
     * Register a GET route
     */
    private function get(string $path, callable $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    /**
     * Register a POST route
     */
    private function post(string $path, callable $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    /**
     * Register a PUT route
     */
    private function put(string $path, callable $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    /**
     * Register a DELETE route
     */
    private function delete(string $path, callable $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    /**
     * Add route to registry
     */
    private function addRoute(string $method, string $path, callable $handler): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'handler' => $handler
        ];
    }

    /**
     * Match and execute the route
     */
    public function dispatch(): void
    {
        foreach ($this->routes as $route) {
            if ($this->matchRoute($route)) {
                $this->executeRoute($route);
                return;
            }
        }

        // No route matched
        $this->sendError(404, 'Endpoint not found');
    }

    /**
     * Check if route pattern matches request
     */
    private function matchRoute(array $route): bool
    {
        if ($route['method'] !== $this->method) {
            return false;
        }

        $pattern = $this->routeToRegex($route['path']);
        if (preg_match($pattern, $this->path, $matches)) {
            $this->pathParams = $matches;
            return true;
        }

        return false;
    }

    /**
     * Convert route pattern to regex
     */
    private function routeToRegex(string $route): string
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $route);
        return '#^' . $pattern . '$#';
    }

    /**
     * Execute the matched route handler
     */
    private function executeRoute(array $route): void
    {
        try {
            $handler = $route['handler'];
            call_user_func($handler, $this->pathParams);
        } catch (Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    /**
     * Get JSON request body
     */
    protected function getBody($assoc = true)
    {
        $input = file_get_contents('php://input');
        return json_decode($input, $assoc);
    }

    /**
     * Send JSON response
     */
    protected function sendResponse(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }

    /**
     * Send error response
     */
    protected function sendError(int $statusCode, string $message): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode(['error' => $message]);
        exit;
    }

    // ====== HANDLER METHODS ======

    public function register(array $params): void
    {
        $body = $this->getBody();
        
        $userModel = new \App\Models\User();
        try {
            $userId = $userModel->register([
                'email' => $body['email'] ?? null,
                'password' => $body['password'] ?? null,
                'first_name' => $body['firstName'] ?? null,
                'last_name' => $body['lastName'] ?? null,
                'role' => $body['role'] ?? 'jobseeker'
            ]);

            $this->sendResponse(['id' => $userId, 'message' => 'User registered successfully'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function login(array $params): void
    {
        $body = $this->getBody();
        
        $userModel = new \App\Models\User();
        $user = $userModel->authenticate($body['email'] ?? '', $body['password'] ?? '');

        if ($user) {
            $this->sendResponse(['user' => $user], 200);
        } else {
            $this->sendError(401, 'Invalid credentials');
        }
    }

    public function getUser(array $params): void
    {
        $userModel = new \App\Models\User();
        $user = $userModel->getById($params['id']);

        if ($user) {
            unset($user['password_hash']);
            $this->sendResponse(['user' => $user], 200);
        } else {
            $this->sendError(404, 'User not found');
        }
    }

    public function updateUser(array $params): void
    {
        $body = $this->getBody();
        $userModel = new \App\Models\User();

        if ($userModel->updateUser($params['id'], $body)) {
            $this->sendResponse(['message' => 'User updated successfully'], 200);
        } else {
            $this->sendError(400, 'Failed to update user');
        }
    }

    public function deleteUser(array $params): void
    {
        $userModel = new \App\Models\User();
        if ($userModel->delete($params['id'])) {
            $this->sendResponse(['message' => 'User deleted'], 200);
        } else {
            $this->sendError(400, 'Failed to delete user');
        }
    }

    public function getUserPublicInfo(array $params): void
    {
        $userModel = new \App\Models\User();
        $user = $userModel->getUserPublicInfo($params['id']);

        if ($user) {
            $this->sendResponse(['user' => $user], 200);
        } else {
            $this->sendError(404, 'User not found');
        }
    }

    public function getProfile(array $params): void
    {
        $profileModel = new \App\Models\Profile();
        $profile = $profileModel->getByUserId($params['userId']);

        if ($profile) {
            $this->sendResponse(['profile' => $profile], 200);
        } else {
            $this->sendError(404, 'Profile not found');
        }
    }

    public function createProfile(array $params): void
    {
        $body = $this->getBody();
        $profileModel = new \App\Models\Profile();

        try {
            $profileId = $profileModel->createProfile($body);
            $this->sendResponse(['id' => $profileId, 'message' => 'Profile created'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function updateProfile(array $params): void
    {
        $body = $this->getBody();
        $profileModel = new \App\Models\Profile();

        // Check if profile exists for this user
        $profile = $profileModel->getByUserId($params['id']);
        
        if ($profile) {
            // Update existing profile
            if ($profileModel->updateProfile($profile['id'], $body)) {
                $this->sendResponse(['message' => 'Profile updated'], 200);
            } else {
                $this->sendError(400, 'Failed to update profile');
            }
        } else {
            // Create new profile
            try {
                $body['user_id'] = $params['id'];
                $profileId = $profileModel->createProfile($body);
                $this->sendResponse(['id' => $profileId, 'message' => 'Profile created'], 201);
            } catch (Exception $e) {
                $this->sendError(400, $e->getMessage());
            }
        }
    }

    public function getFullProfile(array $params): void
    {
        $profileModel = new \App\Models\Profile();
        $profile = $profileModel->getUserProfile($params['userId']);

        if ($profile) {
            // Get additional data
            $skillModel = new \App\Models\Skill();
            $experienceModel = new \App\Models\WorkExperience();
            $educationModel = new \App\Models\Education();
            $badgeModel = new \App\Models\Badge();

            $profile['skills'] = $skillModel->getByUser($params['userId']);
            $profile['experience'] = $experienceModel->getByUser($params['userId']);
            $profile['education'] = $educationModel->getByUser($params['userId']);
            $profile['badges'] = $badgeModel->getByUser($params['userId']);

            $this->sendResponse(['profile' => $profile], 200);
        } else {
            $this->sendError(404, 'Profile not found');
        }
    }

    public function getJobs(array $params): void
    {
        $jobModel = new \App\Models\Job();
        $jobs = $jobModel->getActiveJobs();
        $this->sendResponse(['jobs' => $jobs], 200);
    }

    public function getJob(array $params): void
    {
        $jobModel = new \App\Models\Job();
        $job = $jobModel->getJobWithCompany($params['id']);

        if ($job) {
            $this->sendResponse(['job' => $job], 200);
        } else {
            $this->sendError(404, 'Job not found');
        }
    }

    public function createJob(array $params): void
    {
        $body = $this->getBody();
        $jobModel = new \App\Models\Job();

        try {
            $jobId = $jobModel->createJob($body);
            $this->sendResponse(['id' => $jobId, 'message' => 'Job created'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function updateJob(array $params): void
    {
        $body = $this->getBody();
        $jobModel = new \App\Models\Job();

        if ($jobModel->update($params['id'], $body)) {
            $this->sendResponse(['message' => 'Job updated'], 200);
        } else {
            $this->sendError(400, 'Failed to update job');
        }
    }

    public function deleteJob(array $params): void
    {
        $jobModel = new \App\Models\Job();
        if ($jobModel->delete($params['id'])) {
            $this->sendResponse(['message' => 'Job deleted'], 200);
        } else {
            $this->sendError(400, 'Failed to delete job');
        }
    }

    public function searchJobs(array $params): void
    {
        $jobModel = new \App\Models\Job();
        $jobs = $jobModel->search($params['query']);
        $this->sendResponse(['jobs' => $jobs], 200);
    }

    public function closeJob(array $params): void
    {
        $jobModel = new \App\Models\Job();
        if ($jobModel->closeJob($params['id'])) {
            $this->sendResponse(['message' => 'Job closed'], 200);
        } else {
            $this->sendError(400, 'Failed to close job');
        }
    }

    public function getCompanies(array $params): void
    {
        $companyModel = new \App\Models\Company();
        $companies = $companyModel->getAllWithJobCounts();
        $this->sendResponse(['companies' => $companies], 200);
    }

    public function getCompany(array $params): void
    {
        $companyModel = new \App\Models\Company();
        $company = $companyModel->getWithJobCount($params['id']);

        if ($company) {
            $this->sendResponse(['company' => $company], 200);
        } else {
            $this->sendError(404, 'Company not found');
        }
    }

    public function createCompany(array $params): void
    {
        $body = $this->getBody();
        $companyModel = new \App\Models\Company();

        try {
            $companyId = $companyModel->createCompany($body);
            $this->sendResponse(['id' => $companyId, 'message' => 'Company created'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function updateCompany(array $params): void
    {
        $body = $this->getBody();
        $companyModel = new \App\Models\Company();

        if ($companyModel->updateCompany($params['id'], $body)) {
            $this->sendResponse(['message' => 'Company updated'], 200);
        } else {
            $this->sendError(400, 'Failed to update company');
        }
    }

    public function deleteCompany(array $params): void
    {
        $companyModel = new \App\Models\Company();
        if ($companyModel->delete($params['id'])) {
            $this->sendResponse(['message' => 'Company deleted'], 200);
        } else {
            $this->sendError(400, 'Failed to delete company');
        }
    }

    public function searchCompanies(array $params): void
    {
        $companyModel = new \App\Models\Company();
        $companies = $companyModel->search($params['query']);
        $this->sendResponse(['companies' => $companies], 200);
    }

    public function addSkill(array $params): void
    {
        $body = $this->getBody();
        $skillModel = new \App\Models\Skill();

        try {
            $skillId = $skillModel->addSkill($body['userId'], $body);
            $this->sendResponse(['id' => $skillId, 'message' => 'Skill added'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function getUserSkills(array $params): void
    {
        $skillModel = new \App\Models\Skill();
        $skills = $skillModel->getByUser($params['userId']);
        $this->sendResponse(['skills' => $skills], 200);
    }

    public function updateSkill(array $params): void
    {
        $body = $this->getBody();
        $skillModel = new \App\Models\Skill();

        if ($skillModel->update($params['id'], $body)) {
            $this->sendResponse(['message' => 'Skill updated'], 200);
        } else {
            $this->sendError(400, 'Failed to update skill');
        }
    }

    public function deleteSkill(array $params): void
    {
        $skillModel = new \App\Models\Skill();
        if ($skillModel->delete($params['id'])) {
            $this->sendResponse(['message' => 'Skill deleted'], 200);
        } else {
            $this->sendError(400, 'Failed to delete skill');
        }
    }

    public function addExperience(array $params): void
    {
        $body = $this->getBody();
        $experienceModel = new \App\Models\WorkExperience();

        try {
            $expId = $experienceModel->addExperience($body['userId'], $body);
            $this->sendResponse(['id' => $expId, 'message' => 'Experience added'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function getUserExperience(array $params): void
    {
        $experienceModel = new \App\Models\WorkExperience();
        $experience = $experienceModel->getByUser($params['userId']);
        $this->sendResponse(['experience' => $experience], 200);
    }

    public function updateExperience(array $params): void
    {
        $body = $this->getBody();
        $experienceModel = new \App\Models\WorkExperience();

        if ($experienceModel->updateExperience($params['id'], $body)) {
            $this->sendResponse(['message' => 'Experience updated'], 200);
        } else {
            $this->sendError(400, 'Failed to update experience');
        }
    }

    public function deleteExperience(array $params): void
    {
        $experienceModel = new \App\Models\WorkExperience();
        if ($experienceModel->delete($params['id'])) {
            $this->sendResponse(['message' => 'Experience deleted'], 200);
        } else {
            $this->sendError(400, 'Failed to delete experience');
        }
    }

    public function addEducation(array $params): void
    {
        $body = $this->getBody();
        $educationModel = new \App\Models\Education();

        try {
            $eduId = $educationModel->addEducation($body['userId'], $body);
            $this->sendResponse(['id' => $eduId, 'message' => 'Education added'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function getUserEducation(array $params): void
    {
        $educationModel = new \App\Models\Education();
        $education = $educationModel->getByUser($params['userId']);
        $this->sendResponse(['education' => $education], 200);
    }

    public function updateEducation(array $params): void
    {
        $body = $this->getBody();
        $educationModel = new \App\Models\Education();

        if ($educationModel->update($params['id'], $body)) {
            $this->sendResponse(['message' => 'Education updated'], 200);
        } else {
            $this->sendError(400, 'Failed to update education');
        }
    }

    public function deleteEducation(array $params): void
    {
        $educationModel = new \App\Models\Education();
        if ($educationModel->delete($params['id'])) {
            $this->sendResponse(['message' => 'Education deleted'], 200);
        } else {
            $this->sendError(400, 'Failed to delete education');
        }
    }

    public function getUserBadges(array $params): void
    {
        $badgeModel = new \App\Models\Badge();
        $badges = $badgeModel->getByUser($params['userId']);
        $this->sendResponse(['badges' => $badges], 200);
    }

    public function awardBadge(array $params): void
    {
        $body = $this->getBody();
        $badgeModel = new \App\Models\Badge();

        try {
            $badgeId = $badgeModel->awardBadge($body['userId'], $body);
            $this->sendResponse(['id' => $badgeId, 'message' => 'Badge awarded'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function getBadgeStats(array $params): void
    {
        $badgeModel = new \App\Models\Badge();
        $stats = $badgeModel->getUserBadgeStats($params['userId']);
        $this->sendResponse(['stats' => $stats], 200);
    }

    public function createMatch(array $params): void
    {
        $body = $this->getBody();
        $matchModel = new \App\Models\JobMatch();

        try {
            $matchId = $matchModel->createMatch(
                $body['jobSeekerId'],
                $body['jobId'],
                $body['action'],
                $body['score'] ?? null
            );
            $this->sendResponse(['id' => $matchId, 'message' => 'Match recorded'], 201);
        } catch (Exception $e) {
            $this->sendError(400, $e->getMessage());
        }
    }

    public function getUserMatches(array $params): void
    {
        $matchModel = new \App\Models\JobMatch();
        $matches = $matchModel->getByJobSeeker($params['userId']);
        $this->sendResponse(['matches' => $matches], 200);
    }

    public function getLikedJobs(array $params): void
    {
        $matchModel = new \App\Models\JobMatch();
        $jobs = $matchModel->getLikedJobs($params['userId']);
        $this->sendResponse(['jobs' => $jobs], 200);
    }

    public function getMutualMatches(array $params): void
    {
        $matchModel = new \App\Models\JobMatch();
        $matches = $matchModel->getMutualMatches($params['userId']);
        $this->sendResponse(['matches' => $matches], 200);
    }

    public function getJobRecommendations(array $params): void
    {
        // Get user profile to find preferences
        $profileModel = new \App\Models\Profile();
        $profile = $profileModel->getByUserId($params['userId']);

        if (!$profile) {
            $this->sendError(404, 'Profile not found');
            return;
        }

        // Get matching jobs based on preferences
        $jobModel = new \App\Models\Job();
        $filters = [
            'job_types' => json_decode($profile['job_types'] ?? '[]', true),
            'salary_min' => $profile['salary_min'],
            'industries' => json_decode($profile['industries'] ?? '[]', true)
        ];

        $jobs = $jobModel->getMatching($filters);
        $this->sendResponse(['recommendations' => $jobs], 200);
    }

    public function createApplication(array $params): void
    {
        $body = $this->getBody();
        
        if (!isset($body['userId']) || !isset($body['jobId'])) {
            $this->sendError(400, 'userId and jobId are required');
            return;
        }

        try {
            $db = \App\Database::getConnection();
            $stmt = $db->prepare("
                INSERT INTO applications (user_id, job_id, status, cover_letter, applied_at, updated_at)
                VALUES (:user_id, :job_id, 'new', :cover_letter, NOW(), NOW())
                RETURNING id
            ");
            
            $stmt->execute([
                'user_id' => $body['userId'],
                'job_id' => $body['jobId'],
                'cover_letter' => $body['coverLetter'] ?? null
            ]);
            
            $result = $stmt->fetch();
            $this->sendResponse(['id' => $result['id'], 'message' => 'Application submitted successfully'], 201);
        } catch (\Exception $e) {
            $this->sendError(500, 'Failed to submit application: ' . $e->getMessage());
        }
    }

    public function getUserApplications(array $params): void
    {
        try {
            $db = \App\Database::getConnection();
            $stmt = $db->prepare("
                SELECT a.*, j.title as job_title, j.company_id, c.name as company_name
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN companies c ON j.company_id = c.id
                WHERE a.user_id = :user_id
                ORDER BY a.applied_at DESC
            ");
            
            $stmt->execute(['user_id' => $params['userId']]);
            $applications = $stmt->fetchAll();
            
            $this->sendResponse(['applications' => $applications], 200);
        } catch (\Exception $e) {
            $this->sendError(500, 'Failed to fetch applications: ' . $e->getMessage());
        }
    }

    public function getApplication(array $params): void
    {
        try {
            $db = \App\Database::getConnection();
            $stmt = $db->prepare("
                SELECT a.*, j.*, c.name as company_name
                FROM applications a
                JOIN jobs j ON a.job_id = j.id
                JOIN companies c ON j.company_id = c.id
                WHERE a.id = :id
            ");
            
            $stmt->execute(['id' => $params['id']]);
            $application = $stmt->fetch();
            
            if ($application) {
                $this->sendResponse(['application' => $application], 200);
            } else {
                $this->sendError(404, 'Application not found');
            }
        } catch (\Exception $e) {
            $this->sendError(500, 'Failed to fetch application: ' . $e->getMessage());
        }
    }

    public function updateApplicationStatus(array $params): void
    {
        $body = $this->getBody();
        
        if (!isset($body['status'])) {
            $this->sendError(400, 'Status is required');
            return;
        }

        try {
            $db = \App\Database::getConnection();
            $stmt = $db->prepare("
                UPDATE applications 
                SET status = :status, updated_at = NOW()
                WHERE id = :id
            ");
            
            $stmt->execute([
                'status' => $body['status'],
                'id' => $params['id']
            ]);
            
            $this->sendResponse(['message' => 'Application status updated'], 200);
        } catch (\Exception $e) {
            $this->sendError(500, 'Failed to update application: ' . $e->getMessage());
        }
    }

    // ── JobSeeker Dashboard Handlers ──────────────────────────────────────────

    public function getJobSeekerDashboard(array $params): void
    {
        try {
            $model = new \App\Models\JobSeekerDashboard();
            $profile    = $model->getFullProfile($params['userId']);
            $stats      = $model->getStatistics($params['userId']);
            $completion = $model->getProfileCompletion($params['userId']);
            $recs       = $model->getRecommendations($params['userId'], 5);
            $apps       = $model->getApplications($params['userId']);
            $notifs     = $model->getNotifications($params['userId']);

            $this->sendResponse([
                'profile'         => $profile,
                'statistics'      => $stats,
                'completion'      => $completion,
                'recommendations' => $recs,
                'applications'    => $apps,
                'notifications'   => $notifs,
            ], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getJobSeekerFullProfile(array $params): void
    {
        try {
            $model   = new \App\Models\JobSeekerDashboard();
            $profile = $model->getFullProfile($params['userId']);
            if (!$profile) { $this->sendError(404, 'Profile not found'); return; }
            $this->sendResponse(['profile' => $profile], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function upsertJobSeekerProfile(array $params): void
    {
        $body = $this->getBody();
        try {
            $model = new \App\Models\JobSeekerDashboard();
            $model->upsertProfile($params['userId'], $body);
            $this->sendResponse(['message' => 'Profile saved'], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getProfileCompletion(array $params): void
    {
        try {
            $model      = new \App\Models\JobSeekerDashboard();
            $completion = $model->getProfileCompletion($params['userId']);
            $this->sendResponse(['completion' => $completion], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getJobSeekerStatistics(array $params): void
    {
        try {
            $model = new \App\Models\JobSeekerDashboard();
            $stats = $model->getStatistics($params['userId']);
            $this->sendResponse(['statistics' => $stats], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getLikedJobs(array $params): void
    {
        try {
            $model = new \App\Models\JobSeekerDashboard();
            $jobs  = $model->getLikedJobs($params['userId']);
            $this->sendResponse(['jobs' => $jobs], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getNotifications(array $params): void
    {
        try {
            $unreadOnly = isset($_GET['unread']) && $_GET['unread'] === 'true';
            $model  = new \App\Models\JobSeekerDashboard();
            $notifs = $model->getNotifications($params['userId'], $unreadOnly);
            $this->sendResponse(['notifications' => $notifs], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function markNotificationRead(array $params): void
    {
        $body = $this->getBody();
        try {
            $model = new \App\Models\JobSeekerDashboard();
            $model->markNotificationRead($params['notificationId'], $body['userId'] ?? '');
            $this->sendResponse(['message' => 'Notification marked as read'], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function markAllNotificationsRead(array $params): void
    {
        try {
            $model = new \App\Models\JobSeekerDashboard();
            $model->markAllNotificationsRead($params['userId']);
            $this->sendResponse(['message' => 'All notifications marked as read'], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function recordProfileView(array $params): void
    {
        $body = $this->getBody();
        try {
            $model = new \App\Models\JobSeekerDashboard();
            $model->recordProfileView($params['userId'], $body['viewerUserId'] ?? null);
            $this->sendResponse(['message' => 'View recorded'], 201);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    // ── Company Dashboard Handlers ────────────────────────────────────────────

    public function getCompanyMetrics(array $params): void
    {
        try {
            $model = new \App\Models\CompanyDashboard();
            $metrics = $model->getMetrics($params['companyId']);
            $this->sendResponse(['metrics' => $metrics], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getCompanyAnalytics(array $params): void
    {
        try {
            $model = new \App\Models\CompanyDashboard();
            $analytics = $model->getAnalytics($params['companyId']);
            $this->sendResponse(['analytics' => $analytics], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getCompanyCandidates(array $params): void
    {
        try {
            $filters = [
                'status' => $_GET['status'] ?? null,
                'job_id' => $_GET['job_id'] ?? null,
            ];
            $model = new \App\Models\CompanyDashboard();
            $candidates = $model->getCandidates($params['companyId'], $filters);
            $this->sendResponse(['candidates' => $candidates], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getCompanyJobsFull(array $params): void
    {
        try {
            $model = new \App\Models\CompanyDashboard();
            $jobs = $model->getCompanyJobs($params['companyId']);
            $this->sendResponse(['jobs' => $jobs], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function updateCandidateStatus(array $params): void
    {
        $body = $this->getBody();
        if (!isset($body['status'])) {
            $this->sendError(400, 'Status is required');
            return;
        }
        try {
            $model = new \App\Models\CompanyDashboard();
            $model->updateCandidateStatus($params['applicationId'], $body['status'], $body['notes'] ?? null);
            $this->sendResponse(['message' => 'Candidate status updated'], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getCandidateDetail(array $params): void
    {
        try {
            $model = new \App\Models\CompanyDashboard();
            $detail = $model->getCandidateDetail($params['applicationId']);
            if (!$detail) {
                $this->sendError(404, 'Application not found');
                return;
            }
            $this->sendResponse(['candidate' => $detail], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function getCompanyMembers(array $params): void
    {
        try {
            $model = new \App\Models\CompanyDashboard();
            $members = $model->getMembers($params['companyId']);
            $this->sendResponse(['members' => $members], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function addCompanyMember(array $params): void
    {
        $body = $this->getBody();
        if (!isset($body['userId'])) {
            $this->sendError(400, 'userId is required');
            return;
        }
        try {
            $model = new \App\Models\CompanyDashboard();
            $id = $model->addMember($params['companyId'], $body['userId'], $body['role'] ?? 'recruiter');
            $this->sendResponse(['id' => $id, 'message' => 'Member added'], 201);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }

    public function removeCompanyMember(array $params): void
    {
        try {
            $model = new \App\Models\CompanyDashboard();
            $model->removeMember($params['companyId'], $params['userId']);
            $this->sendResponse(['message' => 'Member removed'], 200);
        } catch (\Exception $e) {
            $this->sendError(500, $e->getMessage());
        }
    }
}
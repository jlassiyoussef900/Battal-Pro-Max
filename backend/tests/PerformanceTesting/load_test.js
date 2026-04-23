import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '1m', target: 50 }, // simulate ramp-up of traffic from 1 to 50 users over 1 minute.
        { duration: '3m', target: 50 }, // stay at 50 users for 3 minutes
        { duration: '1m', target: 0 }, // ramp-down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    },
};

export default function () {
    const res = http.get('http://127.0.0.1:8000/jobs');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'has jobs key': (r) => r.body ? r.body.includes('jobs') : false,
    });
    sleep(1);
}

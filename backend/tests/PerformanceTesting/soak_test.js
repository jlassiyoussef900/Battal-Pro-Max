import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 100 }, // ramp up to 100 users
        { duration: '2h', target: 100 }, // stay at 100 users for 2 hours
        { duration: '2m', target: 0 }, // ramp down.
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

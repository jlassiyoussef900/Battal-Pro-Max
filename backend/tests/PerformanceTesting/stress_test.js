import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '30s', target: 100 }, // below normal load
        { duration: '1m', target: 100 },
        { duration: '30s', target: 200 }, // normal load
        { duration: '1m', target: 200 },
        { duration: '30s', target: 300 }, // around the breaking point
        { duration: '1m', target: 300 },
        { duration: '30s', target: 400 }, // beyond the breaking point
        { duration: '1m', target: 400 },
        { duration: '1m', target: 0 }, // scale down. Recovery stage.
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

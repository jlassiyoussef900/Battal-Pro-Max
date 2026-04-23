import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '10s', target: 50 }, // fast ramp-up to a high point
        { duration: '30s', target: 50 }, // stay at high point for a little bit
        { duration: '10s', target: 400 }, // quick spike to extremely high point
        { duration: '1m', target: 400 }, // stay at extremely high point
        { duration: '10s', target: 50 }, // quick ramp-down to normal load
        { duration: '30s', target: 50 }, // stay at generic load
        { duration: '10s', target: 0 }, // ramp-down to 0
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

const { Router } = require('express');
const { createServiceProxy } = require('../proxy/proxy.handler');
const { getService } = require('../proxy/serviceRegistry');
const { breakers } = require('../proxy/circuitBreaker');

const router = Router();
const { url } = getService('report');
const breaker = breakers.report.middleware();

router.use('/', breaker, createServiceProxy(url, '/reports'));

module.exports = router;

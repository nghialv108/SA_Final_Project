const { Router } = require('express');
const { createServiceProxy } = require('../proxy/proxy.handler');
const { getService } = require('../proxy/serviceRegistry');
const { breakers } = require('../proxy/circuitBreaker');

const router = Router();
const { url } = getService('search');
const breaker = breakers.search.middleware();

router.use('/', breaker, createServiceProxy(url, '/search'));

module.exports = router;

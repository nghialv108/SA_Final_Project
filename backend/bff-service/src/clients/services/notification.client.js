const http = require('../http/httpClient');
const env  = require('../../shared/config/environment');

const BASE = env.CORE_SERVICE_URL;

const getNotifications = (user) => http.get(BASE, `/core/notifications`, user);
const getUnreadCount   = (user) => http.get(BASE, `/core/notifications/unread-count`, user);
const markAsRead       = (id, user) => http.patch(BASE, `/core/notifications/${id}/read`, {}, user);
const markAllAsRead    = (user) => http.patch(BASE, `/core/notifications/read-all`, {}, user);

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead };

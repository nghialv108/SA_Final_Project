/**
 * deviceInfo middleware
 *
 * Mobile client gửi kèm các header custom để BFF biết context:
 *   x-platform:    'ios' | 'android'
 *   x-app-version: '1.2.3'
 *   x-device-id:   'uuid'
 *
 * Nếu không có header → default 'ios' để transformer luôn có giá trị.
 * BFF này chỉ phục vụ mobile nên không cần phân nhánh Web/Mobile.
 */
const deviceInfo = (req, res, next) => {
  req.device = {
    platform:   (req.headers['x-platform']    || 'ios').toLowerCase(),
    appVersion: (req.headers['x-app-version'] || '1.0.0'),
    deviceId:   (req.headers['x-device-id']   || null),
  };
  next();
};

module.exports = deviceInfo;

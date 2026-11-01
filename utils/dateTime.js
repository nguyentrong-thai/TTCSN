function formatDateTime(value) {
  return new Date(value).toLocaleString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });
}

module.exports = { formatDateTime };

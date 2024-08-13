const baseUrl = 'https://your-api-domain.com'; // 设置API的基础路径

const request = (url, method, data, header = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url, // 拼接完整的url
      method: method,
      data: data,
      headers: {
        'Content-Type': 'application/json', // 设置请求的 header
        ...header,
      },
      success(res) {
        const { statusCode, data } = res;
        if (statusCode >= 200 && statusCode < 300) {
          // 请求成功的处理
          resolve(data);
        } else {
          // 可以根据项目需求处理HTTP错误
          reject(`网络请求错误，状态码${statusCode}`);
        }
      },
      fail(err) {
        // 请求失败的处理
        reject(err);
      }
    });
  });
};

/*
// 发起GET请求
get('/path/to/resource', { param: 'value' })
  .then(data => {
    console.log('请求成功', data);
  })
  .catch(error => {
    console.log('请求失败', error);
  });

// 发起POST请求
post('/path/to/resource', { param: 'value' })
  .then(data => {
    console.log('请求成功', data);
  })
  .catch(error => {
    console.log('请求失败', error);
  });
*/

// 导出封装的request方法
module.exports = {
  get: (url, data, header) => request(url, 'GET', data, header),
  post: (url, data, header) => request(url, 'POST', data, header),
  // ...可以根据需要封装更多的方法如put, delete等
};
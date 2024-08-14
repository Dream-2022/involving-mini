self.addEventListener('message', (event) => {
  const file = event.data.file;
  // 模拟计算 MD5 的过程
  const md5 = calculateMD5(file);
  self.postMessage({ type: 'md5', md5 });
});

function calculateMD5(file) {
  // 模拟计算 MD5 的过程
  let progress = 0;
  const totalSize = file.size;
  while (progress < totalSize) {
    // 模拟计算过程中的进度变化
    progress += 1024 * 1024; // 假设每次增加 1MB
    self.postMessage({ type: 'progress', progress });
  }
  return 'fake-md5-hash'; // 返回假的 MD5 值
}
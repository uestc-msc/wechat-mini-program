/**
 * 输入字节数，转换为合适的单位
 * @param `bytes` int
 * @returns `string`
 */
export default function(bytes) {
  const unit_arr = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  while (bytes >= 1000) { // 1000B 使用 KB 做单位 更好
    index++;
    bytes /= 1024;
  }
  return bytes.toFixed(2) + unit_arr[index];
}
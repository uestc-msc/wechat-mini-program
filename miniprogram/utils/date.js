/**
 * 获取 `2020-08-01` 格式的当前日期
 * @returns `string`
 */
export function getDate() {
  const d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1; //js 月份从 0 开始
  let date = d.getDate();
  return year + '-' + month.toString().padStart(2, '0') + '-' + date.toString().padStart(2, '0');
}

/**
 * 获取 `16:41` 或 `16:41:01` 格式时间
 * @param show_seconds 默认为 `false`。为 `true` 时，输出包含秒数
 * @returns `string`
 */
export function getTime(show_seconds = false) {
  let time = new Date().toLocaleTimeString('zh-cn', {hour12: false});
  if (!show_seconds) {
    time = time.slice(0,5);
  } else {
    time = time.slice(0,8);
  }
  return time;
}
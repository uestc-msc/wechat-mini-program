//获取 "2020-08-01" 格式日期
export function getDate() {
  const d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth() + 1; //js 月份从 0 开始
  let date = d.getDate();
  return year + '-' + month.toString().padStart(2, '0') + '-' + date.toString().padStart(2, '0');
}

//获取 "16:41" 或 "16:41:01" 格式时间
export function getTime(seconds = false) {
  time = new Date().toLocaleTimeString('zh-cn', {hour12: false});
  if (!seconds) {
    time = time.slice(0,5);
  }
  return time;
}
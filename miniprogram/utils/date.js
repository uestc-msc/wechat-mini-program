//获取 "2020-08-01" 格式日期
export function getDate() {
  const event = new Date();
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  return event.toLocaleDateString('zh-cn', options).split('/').join('-');
}

//获取 "16:41" 或 "16:41:01" 格式时间
export function getTime(seconds = false) {
  time = new Date().toLocaleTimeString('zh-cn', {hour12: false});
  if (!seconds) {
    time = time.slice(0,5);
  }
  return time;
}
// sleep 函数
// 使用方法为：
// sleep(millisecond).then(callback);
// callback 为 sleep 后要执行的函数

export default function (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
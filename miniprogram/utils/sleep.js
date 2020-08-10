/**
 * sleep 函数
 * 使用方法为：
 * `sleep(time).then(callback);`
 * @param time sleep 的时间，单位为 `ms`
 * @param callback sleep 后要执行的函数
 * @returns `Promise`
 */
export default function (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
/**
 * 解析 URL 中的路径和参数
 * @param url URL
 * @returns object，其中 __path 成员对应原 URL 的链接，其他参数均以 key: value 的形式返回
 */
export default function (url) {
  let array = url.split('?');
  let obj = {
    __path: array[0]
  };
  if (array[1] != undefined) {
    let option_arr = array[1].split('&');
    option_arr.forEach(element => {
      let option = element.split('=');
      if (option.length == 2) {
        obj[option[0]] = option[1];
      }
    });
  }
  return obj;
}
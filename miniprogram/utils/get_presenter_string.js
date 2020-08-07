// limit=3 时，把 ['张三', '李四', '王五', '阮薇薇'] 形式 变成 '张三、李四、王五等'
// limit=0 时，变成 '张三、李四、王五、阮薇薇'
export default function (presenter_list, limit=4) {
  if (limit==0 || limit >= presenter_list.length) {
    return presenter_list.join('、');
  } else {
    let list = presenter_list.slice(0, limit);
    return list.join('、') + '等';
  }
}
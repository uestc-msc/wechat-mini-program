// 获取某次活动的签到名单
// 由于涉及到获取大量用户的名字
// 小程序限制 LIMIT 20，云函数限制 LIMIT 100，故使用云函数一次拉取

const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const MAX_LIMIT = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  let list;
  let errMsg1;
  const wxContext = cloud.getWXContext()

  const db = cloud.database();
  const _ = db.command;
  //查询得到名单
  await db
    .collection('activity_info')
    .doc(event.id)
    .get()
    .then(res => {
      errMsg1 = res;
      list = res.data.check_in_list;
    })
    .catch(err => {
      errMsg1 = err;
    })
  // 将名单的 openid 变为 username 即可返回
  const check_in_collection = db
    .collection('user_info')
    .where({
      _id: _.in(list)
    })
    .orderBy('student_id', 'asc')
    .field({
      _id: false,
      username: true,
      student_id: true
    });
  // 先取出集合记录总数
  const countResult = await check_in_collection.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = check_in_collection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有 promise 完成
  let res = (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  });
  // 解析姓名学号并拼接
  let namelist = res.data.map(Element =>
    Element.student_id.padEnd(18, ' ') + Element.username
  );
  return {
    event: event,
    namelist: namelist,
    errMsg1: errMsg1,
    errMsg2: res.errMsg
  }
  return {
    event: event,
    namelist: namelist,
    errMsg1: errMsg1,
    errMsg2: errMsg2
  }
}
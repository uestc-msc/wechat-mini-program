// 获取管理员名单
// 由于小程序限制 LIMIT 20，云函数限制 LIMIT 100，故使用云函数一次拉取
// v1.2.3 以后该函数将被弃用
const cloud = require('wx-server-sdk');
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});
const db = cloud.database();
const MAX_LIMIT = 100;

exports.main = async (event, context) => {
  console.log(event);
  console.log(context);

  // 超级管理员不应该出现在这个页面
  const admin_collection = db.collection('user_info').where({
    is_admin: true,
    can_grant_admin: false
  })
  .orderBy('student_id', 'asc')
  .field({
    _id: false,
    username: true,
    student_id: true
  });
  // 先取出集合记录总数
  const countResult = await admin_collection.count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = admin_collection.skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
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
    errMsg: res.errMsg
  }
}
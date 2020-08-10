/*
获取数据库某集合中所有元素
由于小程序限制 LIMIT 20，云函数限制 LIMIT 100，故使用云函数一次拉取
调用方法：

wx.cloud.callFunction({
  name: "get_collection",
  data: {
    collection: 'user_info'
  },
  success(){},
  fail(){}
}
*/
const cloud = require('wx-server-sdk');
cloud.init({env: cloud.DYNAMIC_CURRENT_ENV});
const db = cloud.database();
const MAX_LIMIT = 100;

exports.main = async (event, context) => {
  console.log(event);
  console.log(context);

  // 先取出集合记录总数
  const countResult = await db.collection(event.collection).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(event.collection).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}
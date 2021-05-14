//每天定时删除临时创建但没保存的活动

// 云函数入口函数
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  console.log(event)
  console.log(context)

  const db = cloud.database();
  try {
    return await db.collection('activity_info').where({
      date: ""
    }).remove();
  } catch (e) {
    console.error(e)
  }
}
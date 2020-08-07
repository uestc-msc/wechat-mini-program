// 获取某次活动的签到名单
// 由于涉及到获取大量用户的名字
// 且云数据库限制小程序一次只能获取 20 条记录
// 因此使用云函数

// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

let list, namelist;
let errMsg1, errMsg2;

// 云函数入口函数
exports.main = async (event, context) => {
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
    }).catch(err => {
      errMsg1 = err;
    })
  // 将名单的 openid 变为 username 即可返回
  await db
    .collection('user_info')
    .where({
      _id: _.in(list)
    })
    .get()
    .then(res => {
      namelist = [];
      errMsg2 = res;
      res.data.forEach(Element => {
        namelist.push(Element.username + Element.student_id);
      });
    }).catch(err => {
      errMsg2 = err;
    })


  console.log(namelist, errMsg1, errMsg2)
  return {
    event: event,
    namelist: namelist,
    errMsg1: errMsg1,
    errMsg2: errMsg2
  }
}
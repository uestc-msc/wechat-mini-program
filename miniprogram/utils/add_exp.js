/**
 * 为用户增加/减少经验
 * @param `user_list` 用户 id 组成的数组
 * @param `exp_increase` 经验的增量，可正可负
 * @returns `promise`
 */

export default function (user_list, exp_increase) {
  if (typeof (user_list) == 'string') {
    user_list = [user_list];
  }
  // 如果自己需要改变，则在本地也直接修改 app.globalData.exp 进行修改
  const app = getApp();
  if (user_list.includes(app.globalData.openid)) {
    app.globalData.exp += exp_increase;
  }
  // 修改数据库
  const db = wx.cloud.database();
  const _ = db.command;
  return db
    .collection('user_info')
    .where({
      _id: _.in(user_list)
    })
    .update({
      data: {
        exp: _.inc(exp_increase)
      }
    });
}

// 签到经验为 50，对应地主讲人经验为 10，上传/删除图片经验为 5
export const check_in = 50,
  presenter = 10,
  photo = 5;
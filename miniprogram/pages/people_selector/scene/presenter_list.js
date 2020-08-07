let app = getApp();
const db = wx.cloud.database();

export var title = '选择主讲人';

//逻辑相同的函数就直接从隔壁引入了
import {getCurrentActivity} from './check_in_list';

export function onLoad(e, page) {
  getCurrentActivity(e)
  page.setData({
    title: title + page.data.title,
    total: app.globalData.current_activity.presenter_list.length
  });
  wx.setNavigationBarTitle({
    title: page.data.title + page.data.total,
  })
}

export function elementIsChecked(Element) {
  return app.globalData.current_activity.presenter_list.includes(Element._id);
}

export async function listChanged(options) {
  const _ = db.command;
  const oper = options.checked ? _.addToSet : _.pull; // 数据库操作：添加/删除
  // 更新 list 和 namelist
  let res1 = await db
  .collection('activity_info')
  .doc(app.globalData.current_activity._id)
  .update({
    data: {
      presenter_list: oper(options.userid),
      presenter_namelist: oper(options.username)
    }
  });
  // 获取新的 list 的第一位
  let res2 = await db
  .collection('activity_info')
  .doc(app.globalData.current_activity._id)
  .field({
    presenter_list: true
  })
  .get()
  let presenter_list = res2.data.presenter_list;
  if (presenter_list.length == 0) {
    return [res1, res2];
  }
  // console.log(presenter_list[0])
  // 获取他的头像
  let res3 = await db
  .collection('user_info')
  .doc(presenter_list[0])
  .field({
    avatar_url: true
  }).get()
  let avatar_url = res3.data.avatar_url;
  // 将头像更新到数据库
  let res4 = await db
  .collection('activity_info')
  .doc(app.globalData.current_activity._id)
  .update({
    data: {
      avatar_url: avatar_url
    }
  });
  return [res1, res2, res3, res4];
}
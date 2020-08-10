import getActivityInfo from '../../../utils/get_activity_info';

let app = getApp();
const db = wx.cloud.database();
export var title = '选择主讲人';

//逻辑相同的函数就直接从隔壁引入了
import {
  getCurrentActivity
} from './check_in_list';

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
  const oper = options.checked ? _.push : _.pull; // 数据库操作：添加/删除
  // 更新 list
  let res = await db
    .collection('activity_info')
    .doc(app.globalData.current_activity._id)
    .update({
      data: {
        presenter_list: oper(options.userid)
      }
    });
  // 获取新的 presenter_string 并刷新上一页
  getActivityInfo({
    id: app.globalData.current_activity._id
  }).then(res => {
    let cur = res[0];
    app.globalData.current_activity = cur;
    let pages = getCurrentPages();
    let last_page = pages[pages.length - 2]; // 上一页
    last_page.onPullDownRefresh();
  });
  return res;
}
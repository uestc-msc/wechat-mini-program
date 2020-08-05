let app = getApp();
const db = wx.cloud.database();

export var title = '选择主讲人';

//逻辑相同的函数就直接从隔壁引入了
import {onLoad} from './check_in_list';
export {onLoad};

export function getTotalAndSetTitle(page) {
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
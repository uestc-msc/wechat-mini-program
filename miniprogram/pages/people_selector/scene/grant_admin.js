import log from "../../../utils/log";

let app = getApp();
const db = wx.cloud.database();

export var title = '设置管理员';

export function onLoad(e, page) {
  if (!app.globalData.can_grant_admin) {
    wx.navigateBack({
      delta: 1,
    });
    wx.showToast({
      title: '没有权限',
      icon: 'none'
    });
  }
  //查询管理员总人数
  db
    .collection('user_info')
    .where({
      is_admin: true
    })
    .count({
      success: res => {
        page.setData({
          title: title + page.data.title,
          total: res.total
        });
        wx.setNavigationBarTitle({
          title: page.data.title + page.data.total,
        });
      },
      fail: res => {
        console.log(res);
        wx.showToast({
          title: '获取总人数失败 _(:з」∠)_',
          icon: 'none'
        });
      }
    });
}

export function elementIsChecked(Element) {
  return Element.is_admin;
}

export async function listChanged(options) {
  let promise = db
    .collection('user_info')
    .doc(options.user_id)
    .update({
      data: {
        is_admin: options.checked
      }
    });
    promise.then(res => { // 更新日志
    log({
      oper: 'modify_admin',
      data: {
        user: options.user_id,
        oper: options.checked ? 'set' : 'unset'
      }
    });
  });
  let res = await promise;
  // console.log(res);
  return res;
}
// pages/check_in/check_in.js
import {
  getDate
} from '../../utils/date';
import sleep from '../../utils/sleep'
import resolveUrl from '../../utils/resolve_url'

var app = getApp();
const db = wx.cloud.database();
const _ = db.command;

// “扫码签到” 按钮的回调函数
export function scanCode() {
  wx.scanCode({
    success: res => {
      let obj = resolveUrl(res.path);
      if (obj.scene == undefined) {
        wx.showToast({
          title: '小程序码中没有识别到活动信息',
          icon: 'none'
        });
        return;
      } else {
        return checkIn({
          activity_id: obj.scene
        })
      }
    },
    fail: err => {
      console.log(err)
      if (err.errMsg == "scanCode:fail") {
        wx.showToast({
          title: '未识别到小程序码',
          icon: 'none'
        })
      }
    }
  })
};

/**
 * 输入 acitivity_id，尝试进行签到
 * @params `options.activity_id` 签到的活动
 */
export async function checkIn(options) {
  // 如果没有 openid 则每 0.5s 尝试 checkIn，直至获取到 openid
  if (app.globalData.openid == '') {
    sleep(500).then(() => checkIn(options));
    return;
  }
  wx.showLoading({
    title: '正在签到',
    mask: true
  });
  options.user_id = app.globalData.openid;
  // 从数据库加载该次活动信息（需要核对是不是今天）
  console.log(options.activity_id)
  let res = await (async () => {
      if (!options.activity_id || options.activity_id == '') {
        return Promise.reject('activity_id is null');
      }
    })()
    .then(res =>
      db.collection('activity_info')
      .doc(options.activity_id)
      .get()
    )
    .catch(err => {
      console.log(err)
      return Promise.reject({
        errMsg: "activity_id 错误: <" + options.activity_id + ">"
      });
    })
    .then(res => {
      app.globalData.current_activity = res.data;
      if (res.data.date != getDate()) {
        return Promise.reject({
          errMsg: "活动当天才可以签到哦"
        });
      } else if (res.data.check_in_list.includes(options.user_id)) {
        wx.navigateTo({
          url: '/pages/activities/activities_detail/activities_detail?id=' + options.activity_id
        });
        return Promise.reject({
          errMsg: "你已经签过到啦"
        });
      } else {
        // 开始签到
        return db.collection('activity_info')
          .doc(options.activity_id)
          .update({
            data: {
              check_in_list: _.addToSet(options.user_id)
            }
          });
      }
    })
    .then(res => {
      wx.hideLoading();
      // 跳转到对应活动页
      wx.navigateTo({
        url: '/pages/activities/activities_detail/activities_detail?id=' + options.activity_id
      });
      wx.showToast({
        title: '签到成功'
      });
      return res;
    })
    .catch(err => {
      wx.hideLoading();
      // console.log(err);
      wx.showToast({
        title: err.errMsg,
        icon: 'none',
        duration: 10000
      });
      return err;
    });
  console.log(res)
  return res;
}
// 获取活动信息
// 由于还需要获取主讲人姓名、头像等
// 故独立为一个页面

import getPresenterString from 'get_presenter_string.js';

const db = wx.cloud.database();
const _ = db.command;

// 接收参数：
// id:    获取的活动的 _id
// limit: 如果不存在 id，则 limit 为 limit 的参数
// skip:  为 skip 的参数
// callback(activities): 对于每一个查询到的活动，都会调用一次回调函数。如果没有查询结果，依旧会调用一次，但 res.data 为 []

export default async function (options) {
  // var startTime = new Date().getTime();
  if (options == undefined || options.id == undefined && options.limit == undefined) {
    wx.showToast({
      title: '参数错误',
      icon: 'none'
    });
    return Promise.reject(new Error('参数错误：options.id 和 options.limit 同时为 undefined'));
  }
  // 从数据库获取活动的信息
  let c = db.collection('activity_info');
  if (options.id == undefined) {
    c = c.where({
        is_hidden: false
      })
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')
      .skip(options.skip ? options.skip : 0)
      .limit(options.limit)
  } else {
    c = c.doc(options.id);
  }
  c.get()
    .then(res => {
      let activities = res.data;
      // 将 activities 统一为数组
      if (options.id != undefined) {
        activities = [activities];
      }
      // console.log(activities);
      // var endTime = new Date().getTime();
      // console.log(endTime - startTime);
      if (activities.length == 0) {
        options.callback(activities); // 保证至少调用一次 callback
      }
      // 用 presenter_list 主讲人列表，在 user_info 集合中查询每位主讲人的姓名，还有第一位的头像
      // 生成需要展示的 presenter_string 字符串和 avatar_url 头像
      for (let i = 0; i < activities.length; i++) {
        db.collection('user_info').where({
            _id: _.in(activities[i].presenter_list)
          })
          .get()
          .then(res => {
            let namelist = res.data.map(Element => Element.username);
            try {
              activities[i].avatar_url = res.data[0].avatar_url; // 如果没有主讲人，会触发错误
            } catch (error) {
              activities[i].avatar_url = '/images/icon_ruanweiwei_alt_2.jpg';
            }
            activities[i].presenter_string = getPresenterString(namelist);
            options.callback(activities);
          })
      }
    })
    .catch(err => {
      console.log(err);
      wx.hideLoading();
      wx.showToast({
        title: '读取数据库失败',
        icon: 'none'
      });
      wx.navigateBack({
        delta: 1,
      });
    })
}
import getPresenterString from 'get_presenter_string.js';

const db = wx.cloud.database();
const _ = db.command;

/**
 * 获取活动信息。由于还需要获取主讲人姓名、头像等，故独立为一个页面
 * @param id 获取的活动的 `_id`
 * @param limit 数据库查询中 `limit` 的参数，仅 `id` 为 `undefined` 时有效
 * @param skip 数据库查询中 `skip` 的参数
 * @returns `Promise`
 */
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
  var promise_array = [], activities;
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
  return await c.get()
    .then(res => {
      activities = res.data;
      // 将 activities 统一为数组
      if (options.id != undefined) {
        activities = [activities];
      }
      // console.log(activities);
      // var endTime = new Date().getTime();
      // console.log(endTime - startTime);

      // 用 presenter_list 主讲人列表，在 user_info 集合中查询每位主讲人的姓名，还有第一位的头像
      // 生成需要展示的 presenter_string 字符串和 avatar_url 头像
      for (let i = 0; i < activities.length; i++) {
        let promise = db.collection('user_info').where({
            _id: _.in(activities[i].presenter_list)
          })
          .get()
          .then(res => {
            let namelist = res.data.map(Element => Element.username);
            try {
              activities[i].avatar_url = res.data[0].avatar_url; // 如果没有主讲人，会触发错误
            } catch (error) {
              activities[i].avatar_url = '/images/icon_ruanweiwei_alt_2.jpg'; //头像换为临时图片
            }
            activities[i].presenter_string = getPresenterString(namelist);
            return activities;
          });
        promise_array.push(promise);
      }
    })
    .then(() => {
      // 将 for 中所有的 promise 整合为一个 promise
      if (promise_array == 0) {
        return;
      } else {
        return Promise.all(promise_array).then(res_arr => {
          // console.log(res_arr[res_arr.length - 1])
          // console.log(res_arr[1] == res_arr[0])
          // 所有 res 是同一个的引用
          return res_arr[0];
        })
      }
    })
    .catch(err => {
      console.log(err);
      wx.hideLoading();
      wx.showToast({
        title: '数据出错啦 _(:з」∠)_',
        icon: 'none'
      });
      wx.navigateBack({
        delta: 1,
      });
    })
}
// pages/activities/activities_detail/check_in_list/check_in_list.js

var app = getApp();
var that;

Page({
  data: {
    title: '',
    check_in_total: 0,
    check_in_name_text: ''
  },
  copyListToClipBoard(e) {
    var text = this.data.check_in_name_text;
    wx.setClipboardData({
      data: text
    });
  },
  onLoad: function (e) {
    that = this;
    //尝试从全局变量中读取是否有该次活动的信息，如果有就先默认填上
    if (typeof (app.globalData.current_activity) != 'undefined' && app.globalData.current_activity._id == e.id) {
      setPageData();
    }
    //从数据库获取最新数据以后再覆盖
    fetchData(e.id).then(setPageData);
    getCheckInList(e.id);
  },
  async onPullDownRefresh() {
    await getCheckInList(app.globalData.current_activity._id);
    wx.stopPullDownRefresh();
  }
})

async function fetchData(id) {
  const db = wx.cloud.database();
  await db
    .collection('activity_info')
    .doc(id)
    .get({
      success: res => {
        app.globalData.current_activity = res.data;
        // console.log(res.data);
      },
      fail: err => {
        console.log(err);
        wx.navigateBack({
          delta: 1,
        })
        wx.showToast({
          title: '参数错误或无法访问数据库',
          icon: 'none'
        });
      }
    });
}

function setPageData() {
  let cur = app.globalData.current_activity;
  that.setData({
    title: cur.title,
    check_in_total: cur.check_in_list.length
  })
}

async function getCheckInList(id) {
  wx.showLoading({
    title: '正在拿出点名册',
    complete: res => {}
  });
  await wx.cloud.callFunction({
    name: 'get_check_in_list',
    data: {
      id: app.globalData.current_activity._id
    },
    success: res => {
      let namelist_string = res.result.namelist.join('\n');
      //如果有人未完善信息就签到，会导致 namelist 没有这个人，但 check_in_list 有
      let unregistered_check_in = app.globalData.current_activity.check_in_list.length - res.result.namelist.length;
      if (unregistered_check_in > 0) {
        namelist_string += '\n（' + unregistered_check_in + ' 人尚未完善信息）'
      }
      that.setData({
        check_in_name_text: namelist_string
      })
      wx.hideLoading();
    }
  })
}
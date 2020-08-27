// pages/activities/activities_detail/lottery/lottery.js

import shuffle from '../../../../utils/shuffle'

var app = getApp();
var that;

Page({
  data: {
    title: '',
    check_in_namelist: [],
    picker_range: [],
    lottery_list_text: "阮薇薇已经等不及开奖了~",
    picker_index: 0,
    button_name: '开奖！'
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
  },
  bindPickerChange: function (e) {
    this.setData({
      picker_index: parseInt(e.detail.value)
    })
  },
  copyListToClipBoard(e) {
    var text = this.data.lotteryListText;
    wx.setClipboardData({
      data: text
    });
  },
  drawLottery() {
    let namelist = this.data.check_in_namelist,
      shuffled_namelist = shuffle(namelist),
      lottery_namelist = shuffled_namelist.slice(0, this.data.picker_index + 1),
      formatted_namelist = lottery_namelist.map((Element, index) => (index + 1) + ': ' + Element);
    this.setData({
      lottery_list_text: formatted_namelist.join('\n')
    });
    wx.showToast({
      title: '请及时截图保存~',
      icon: 'none'
    });
    this.setData({
      button_name: '再开一次！'
    })
  },
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
    check_in_total: cur.check_in_list.length,
    picker_range: [...new Array(cur.check_in_list.length+1).keys()].slice(1) // 生成 [1, 2, ..., {{cur.check_in_list.length}}]
  })
}

async function getCheckInList(id) {
  wx.showLoading({
    title: '正在拿出点名册',
    mask: true
  });
  await wx.cloud.callFunction({
    name: 'get_collection',
    data: {
      collection: 'check_in_list',
      id: app.globalData.current_activity._id
    },
    success: res => {
      that.setData({
        check_in_total: res.result.namelist.length,
        check_in_namelist: res.result.namelist
      })
      wx.hideLoading();
    }
  })
}
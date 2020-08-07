// pages/activities/activities_detail_admin/activities_detail_admin.js

import getPresenterString from '../../../utils/get_presenter_string.js'
import {
  getDate
} from '../../../utils/date.js';
import sleep from '../../../utils/sleep';

var app = getApp();
var that;

Page({
  data: {
    today: getDate(),
    title: "",
    presenter_string: "",
    date: "",
    time: "",
    check_in_total: "",
    is_admin: false,

    wxacode_url: "",
    show_wxacode: false
  },
  onLoad: function (e) {
    that = this;
    //尝试从全局变量中读取是否有该次活动的信息，如果有就先默认填上
    if (typeof (app.globalData.current_activity) != 'undefined' && app.globalData.current_activity._id == e.id) {
      setPageData();
    }
    //从数据库获取最新数据以后再覆盖
    fetchData(e.id).then(setPageData);
    // 获取签到二维码
    wx.cloud.callFunction({
      name: "get_check_in_wxacode",
      data: {
        id: e.id
      },
      success(res) {
        let wxacode_url = "data:image/png;base64," + wx.arrayBufferToBase64(res.result.buffer);
        that.setData({
          wxacode_url: wxacode_url
        })
      },
      fail(err) {
        console.log(err)
        wx.showToast({
          title: '获取签到二维码失败 请联系管理员',
          icon: 'none'
        })
      }
    })
  },
  onPullDownRefresh() {
    fetchData(app.globalData.current_activity._id).then(() => {
      setPageData();
      wx.showToast({
        title: '刷新成功',
        icon: 'none'
      })
      sleep(500).then(() => {
        wx.stopPullDownRefresh()
      })
    });
  },
  modifyPresenter() {
    if (app.globalData.is_admin) {
      wx.navigateTo({
        url: '/pages/people_selector/people_selector?id=' +
          app.globalData.current_activity._id +
          '&modify=presenter_list'
      })
    } else {
      //非管理员尝试修改主讲人时的提示
      wx.showToast({
        title: '非管理员不能修改主讲人哦',
        icon: 'none',
        duration: 1000
      });
    }
  },
  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },
  inputSubmit(e) {
    // console.log(e);
    var value = e.detail.value;
    var that = this;
    if (!value.location || !value.title) {
      wx.showToast({
        title: '请把消息补充完整喔',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    // 将其他信息存入为全局变量
    app.globalData.current_activity.title = value.title;
    app.globalData.current_activity.date = value.date;
    app.globalData.current_activity.time = value.time;
    app.globalData.current_activity.location = value.location;
    // 将其他信息存入数据库
    const db = wx.cloud.database();
    db.collection('activity_info')
      .doc(app.globalData.current_activity._id)
      .update({
        data: {
          title: value.title,
          date: value.date,
          time: value.time,
          location: value.location,
        },
        success: res => {
          //修改上一页面的信息，然后 navigateBack 到上一页
          var pages = getCurrentPages();
          var prevPage = pages[pages.length - 2];
          prevPage.setData(app.globalData.current_activity); // 把 current_activity 的每个属性直接给 page
          wx.navigateBack({
            delta: 1,
          });
          wx.showToast({
            title: '修改成功',
            duration: 2000
          })
        },
        fail: err => {
          console.log(err);
          wx.showToast({
            title: '修改失败',
            duration: 2000,
            icon: 'none'
          });
        }
      });
  },
  deleteActivity() {
    wx.showModal({
      title: '确认删除',
      content: '真的要删除吗？这是不可逆的哦',
      success(res) {
        if (res.confirm) {
          const db = wx.cloud.database();
          db
            .collection('activity_info')
            .doc(app.globalData.current_activity._id)
            .update({
              data: {
                // 只是隐藏了 activities 并没有删除
                is_hidden: true
              },
              success: res => {
                wx.navigateBack({
                  delta: 2,
                });
                wx.showToast({
                  title: '删除成功',
                });
              },
              fail: err => {
                wx.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              }
            });
        }
      }
    })
  },
  // 全屏查看小程序码
  showWxacode() {
    this.setData({
      show_wxacode: true
    });
  },
  closeWxacode() {
    this.setData({
      show_wxacode: false
    });
  },
  downloadWxacode() {
    let that = this;
    wx.authorize({
      scope: "scope.writePhotosAlbum",
      success: res => {
        wx.getFileSystemManager().writeFile({
          filePath: wx.env.USER_DATA_PATH + '/temp.png',
          data: that.data.wxacode_url.slice(22), // 把 data:image/png;base64, 去除
          encoding: 'base64',
          success: res => {
            wx.saveImageToPhotosAlbum({
              filePath: wx.env.USER_DATA_PATH + '/temp.png',
              success: function (res) {
                console.log(res);
                wx.showToast({
                  title: '保存成功',
                  icon: 'none',
                  duration: 5000
                })
              },
              fail: function (err) {
                console.log(err)
                wx.showToast({
                  title: '保存失败',
                  icon: 'none'
                })
              }
            })
          },
          fail: err => {
            console.log(err)
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            })
          }
        })
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          title: '没有写入相册的权限',
          icon: 'none'
        })
      }
    });
  },
  //手动签到
  checkInManually(e) {
    if (getDate() != app.globalData.current_activity.date) {
      wx.showToast({
        title: '活动当天才可以签到哦',
        icon: 'none'
      })
      return;
    }
    wx.navigateTo({
      url: '/pages/people_selector/people_selector?id=' +
        app.globalData.current_activity._id +
        '&modify=check_in_list',
    })
  },
  showCheckInList() {
    wx.navigateTo({
      url: 'check_in_list/check_in_list?id=' +
        app.globalData.current_activity._id +
        '&modify=check_in_list',
    })
  },
  callGallery() {

  },
  callLottery() {
    wx.navigateTo({
      url: 'lottery/lottery?id=' +
        app.globalData.current_activity._id
    })
  }
});

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
    presenter_string: getPresenterString(cur.presenter_namelist, 0),
    date: cur.date,
    time: cur.time,
    location: cur.location,
    check_in_total: cur.check_in_list.length,
    is_admin: app.globalData.is_admin || cur.presenter_list.includes(app.globalData.openid)
  })

  //如果本人是主讲人或全局的管理员，则也是这次活动的管理员
  if (!that.data.is_admin) {
    wx.navigateBack({
      delta: 1,
    });
    wx.showToast({
      title: '你还不是管理员 不能进入这种地方的',
      icon: 'none',
      duration: 2000
    });
  }
}

// Page({

//   /**
//    * 页面的初始数据
//    */
//   data: {

//   },

//   /**
//    * 生命周期函数--监听页面加载
//    */
//   onLoad: function (options) {

//   },

//   /**
//    * 生命周期函数--监听页面初次渲染完成
//    */
//   onReady: function () {

//   },

//   /**
//    * 生命周期函数--监听页面显示
//    */
//   onShow: function () {

//   },

//   /**
//    * 生命周期函数--监听页面隐藏
//    */
//   onHide: function () {

//   },

//   /**
//    * 生命周期函数--监听页面卸载
//    */
//   onUnload: function () {

//   },

//   /**
//    * 页面相关事件处理函数--监听用户下拉动作
//    */
//   onPullDownRefresh: function () {

//   },

//   /**
//    * 页面上拉触底事件的处理函数
//    */
//   onReachBottom: function () {

//   },

//   /**
//    * 用户点击右上角分享
//    */
//   onShareAppMessage: function () {

//   }
// })
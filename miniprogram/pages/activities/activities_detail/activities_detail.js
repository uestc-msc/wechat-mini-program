// pages/activities/activities_detail/activities_detail.js

import {
  scanCode
} from '../../check_in/check_in.js';
import getActivityInfo from '../../../utils/get_activity_info.js'
import {
  getDate, getTime
} from '../../../utils/date';

const app = getApp();
var that;
// let tap_title_total = 0;
const db = wx.cloud.database();
// 订阅消息模板id
// 参考 https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html
// 这里使用的模板为：留言回复通知（回复内容、回复时间、回复者）
const templateId = 'KLA0FQyb43hK0927G22lu6WYozMmjDH_E8nUQygwQ0A';

Page({
  data: {
    title: "",
    presenter_string: "",
    date: "",
    is_today: false,
    time: "",
    check_in_total: "",
    checked_in: false, // 用户已签到
    is_admin: app.globalData.is_admin,

    //以下为留言的数据
    maxNumber: 140, //可输入最大字数
    number: 0, //已输入字数

    show: false, //是否弹出留言面板
    showReply: false, //是否弹出回复面板
    // authority: false, //鉴权 -> is_admin
    loading: true, //是否正在加载
    textValue: "",
    replyMsgId: "", // 如果主讲人正在回复，记录回复的消息的 id
    userId: "", //用户openid
    acceptSubscribeMessage: false, // 用户评论时已允许订阅消息推送

    //留言数据
    pageId: "",          // 当前 pageid
    name: "",            // 当前用户 id
    imageSrc: "",        // 当前用户头像 url
    // goodCount: 0,
    can_upload: false,
  },
  onLoad: function (e) {
    wx.showNavigationBarLoading();
    that = this;
    this.setData({
      can_upload: app.globalData.app_settings.can_upload,
      imageSrc: app.globalData.avatar_url,
      name: app.globalData.username,
      pageId: e.id
    });
    //尝试从全局变量中读取是否有该次活动的信息，如果有就先默认填上
    if (typeof (app.globalData.current_activity) != 'undefined' && app.globalData.current_activity._id == e.id) {
      setPageData();
    }
    //从数据库获取最新数据以后再覆盖
    getActivityInfo({
        id: e.id,
      })
      .then(res => {
        let cur = res[0];
        app.globalData.current_activity = cur;
        setPageData();
        wx.hideNavigationBarLoading();
      });
  },
  // tapTitle () {
  //   tap_title_total++;
  //   if (tap_title_total == 5) {
  //     tap_title_total = 0;
  //     wx.setClipboardData({
  //       data: app.globalData.current_activity._id,
  //     });
  //     this.setData({
  //       show_id: true
  //     })
  //   }
  // },
  callGallery() {
    wx.navigateTo({
      url: '/pages/gallery/album_detail/album_detail?album_id=' + app.globalData.current_activity._id,
    })
  },
  callCheckIn() {
    scanCode();
  },
  callActivityDetailAdmin(e) {
    wx.navigateTo({
      url: '/pages/activities/activities_detail_admin/activities_detail_admin?id=' +
        app.globalData.current_activity._id,
    })
  },
  onPullDownRefresh() {
    getActivityInfo({
        id: app.globalData.current_activity._id,
      })
      .then(res => {
        app.globalData.current_activity = res[0];
        setPageData();
        wx.showToast({
          title: '刷新成功',
          icon: 'none'
        })
        wx.stopPullDownRefresh()
      });
  },
  // 以下为评论区部分代码
  // 置顶
  toTop: function (e) {
    let top = !e.currentTarget.dataset.msgdata.top;
    db.collection("comment_info").doc(e.currentTarget.dataset.msgid).update({
      data: {
        top: top,
      }
    }).then(res => {
      wx.showToast({
        title: top ? "置顶成功" : "取消成功",
        icon: "success"
      });
      this.getCommentData();
    })
  },

  //删除
  delect: function (e) {
    wx.showModal({
      title: '确认删除',
      content: '真的要删除吗？这是不可逆的哦',

      success(res) {
        if (res.confirm) {
          // console.log(e.currentTarget.dataset.msgid)
          db.collection('comment_info').doc(e.currentTarget.dataset.msgid).remove()
            .then(res => {
              wx.showToast({
                title: "删除成功",
                icon: "success",
              })
              that.getCommentData();
            })
        }
      }

    })
  },

  invalid_comment: function (str) {
    return str == 'undefined' || !str || !/[^\s]/.test(str);
  },
  // 用户可选订阅消息，主讲人回复用户时，用户会有微信推送
  onAcceptSubscribeMessage(e) {

    // 这个地方 PC 模拟器会提示 requestSubscribeMessage:fail can only be invoked by user TAP gesture.
    // 但是手机是正常的
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success(res) {
        console.log(res)
        wx.showToast({
          title: "消息订阅成功 主讲人回复时会有微信推送",
          icon: "none"
        });
        that.setData({
          acceptSubscribeMessage: true
        })
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  // 提交留言
  onSubmit: function (e) {
    // console.log(e.detail.value.msgInput);
    if (this.invalid_comment(e.detail.value.msgInput)) {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none'
      });
      return;
    }
    wx.showLoading({
      title: '提交留言...',
    })
    db.collection("comment_info").add({
      data: {
        imageSrc: this.data.imageSrc,
        name: this.data.name,
        text: e.detail.value.msgInput,
        pageId: this.data.pageId,
        // good: false, //判断有无人点赞
      }
    }).then(res => {
      console.log(res)
      wx.showToast({
        title: '评论成功',
        icon: 'success'
      });
      this.setData({
        textValue: ""
      });
      this.getCommentData();
      this.onClose();
    })
  },
  // 管理员回复评论
  reSubmit: function (e) {
    if (this.invalid_comment(e.detail.value.msgInput)) {
      wx.showToast({
        title: '评论不能为空',
        icon: 'none'
      });
      return;
    }
    //回复
    db.collection("comment_info").doc(this.data.replyMsgId).update({
      data: {
        reply: e.detail.value.msgInput
      },
    }).then(res => {
      console.log(res)
      wx.showToast({
        title: "回复成功",
        icon: "success"
      });
      this.setData({
        textValue: ""
      });
      this.closeRe();
      this.getCommentData();
      // 推送微信消息给被回复的人
      wx.cloud.callFunction({
        name: 'reply_push',
        data: {
          data: {
            date1: {
              // value: Date().toLocaleString('zh-cn')
              value: getDate() + " " + getTime()
            }, // 回复时间
            thing2: {
              value: e.detail.value.msgInput
            }, // 回复内容
            name3: {
              value: this.data.name
            }, // 回复者名字
          },
          templateId: templateId,
          // id: this.data.replyMsgId,
          userId: this.data.replyUserId, // 推送的对象
          page: `pages/activities/activities_detail/activities_detail?id=${this.data.pageId}` // 用户点击推送后跳转的页面
        },
        success(res) {
          console.log(res)
        },
        fail(res) {
          console.log(res)
        }
      });
    })
  },

  //点赞
  // tapGood: function (e) {
  //   db
  //     .collection('message')
  //     .doc(e.currentTarget.dataset.msgid)
  //     .get()
  //     .then(res => {
  //       console.log(res)
  //       if (res.data.goodCount == null) {
  //         res.data.goodCount = 0;
  //       }
  //       db.collection('message').doc(e.currentTarget.dataset.msgid).update({
  //         data: {
  //           good: true,
  //           goodCount: Number(res.data.goodCount) + 1,
  //         },
  //       }).then(res => {
  //         this.getCommentData()
  //       })
  //     })
  // },

  // 页面刷新获取数据
  getCommentData: function (e) {
    // console.log('getting data')
    db.collection("comment_info").where({
        pageId: this.data.pageId
      }).orderBy(
        'top', 'desc'
      ).get()
      .then(res => {
        // console.log(res)
        this.setData({
          msgList: res.data,
          loading: false
        })
      })
  },

  //监听记录输入字数
  inputText: function (e) {
    let value = e.detail.value;
    value = value.substr(0, this.data.maxNumber);
    let len = value.length;
    this.setData({
      'number': len
    })
  },

  //弹出面板设置
  showPopup(e) {
    this.setData({
      show: true,
      acceptSubscribeMessage: false,
    });
  },
  onClose() {
    this.setData({
      show: false
    });
  },
  showRe(e) {
    this.setData({
      showReply: true,
      replyMsgId: e.currentTarget.dataset.msgid,
      replyUserId: e.currentTarget.dataset.userid
    });
  },
  closeRe() {
    this.setData({
      showReply: false
    });
  },
});

// 将 globalData 中的活动数据渲染到页面
function setPageData() {
  let cur = app.globalData.current_activity;
  that.setData({
    // _id: cur._id,
    title: cur.title,
    presenter_string: cur.presenter_string,
    date: cur.date,
    is_today: cur.date == getDate(),
    time: cur.time,
    location: cur.location,
    check_in_total: cur.check_in_list.length,
    checked_in: cur.check_in_list.includes(app.globalData.openid),
    //如果本人是主讲人，则也是这次活动的管理员
    is_admin: app.globalData.is_admin || cur.presenter_list.includes(app.globalData.openid),
    //读完 activity_info 以后再刷新一下 app_settings 等全局变量
    can_upload: app.globalData.app_settings.can_upload,
    imageSrc: app.globalData.avatar_url,
    name: app.globalData.username,
  });
  //设置评论
  that.getCommentData();
}
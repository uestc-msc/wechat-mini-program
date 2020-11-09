// pages/activities/activities_detail/activities_detail.js

import {
  scanCode
} from '../../check_in/check_in.js';
import getActivityInfo from '../../../utils/get_activity_info.js'
import {
  getDate,
  getTime
} from '../../../utils/date';

const app = getApp();
var that;
let tap_title_total = 0;
const db = wx.cloud.database();
const _ = db.command;
// 订阅消息模板id
// 参考 https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/subscribe-message.html
// 这里使用的模板为：留言回复通知（回复内容、回复时间、回复者）
const template_id = 'KLA0FQyb43hK0927G22lu6WYozMmjDH_E8nUQygwQ0A';

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
    openid: app.globalData.openid,

    //以下为留言的数据
    comment_list: [], // 留言的数据
    max_number: 140, // 可输入最大字数
    number: 0, // 已输入字数

    show_comment_popup: false, // 是否弹出留言面板
    show_reply_popup: false, // 是否弹出回复面板
    loading_comment: true, // 是否正在加载
    comment_text: "",
    reply_message_id: "", // 如果主讲人正在回复，记录回复的消息的 id
    can_upload: false, // 是否能留言
  },
  onLoad: function (e) {
    wx.showNavigationBarLoading();
    that = this;
    this.setData({
      can_upload: app.globalData.app_settings.can_upload,
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
  tapTitle() {
    tap_title_total++;
    if (tap_title_total == 5) {
      tap_title_total = 0;
      wx.setClipboardData({
        data: app.globalData.current_activity._id,
      });
      this.setData({
        show_id: true
      });
    }
  },
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

  // 以下为留言区部分代码

  invalid_comment: function (str) {
    return str == 'undefined' || !str || !/[^\s]/.test(str);
  },

  // 提交留言
  onSubmit: function (e) {
    if (this.invalid_comment(e.detail.value.commentInput)) {
      wx.showToast({
        title: '留言不能为空',
        icon: 'none'
      });
      return;
    }
    // 让用户同意订阅的同时上传，就不需要设置一个 showLoading 让用户等待了
    // wx.showLoading({
    //   title: '提交留言...',
    // })
    db.collection("comment_info").add({
      data: {
        avatar_url: app.globalData.avatar_url,
        username: app.globalData.username,
        comment_text: e.detail.value.commentInput,
        activity_id: app.globalData.current_activity._id,
        like_list: [],
        like_count: 0, // 虽然可以从 like_list 计算得出，但是这是查询语句排序的依据，所以就额外维护一下
      }
    }).then(res => {
      console.log(res)
      this.setData({
        comment_text: ""
      });
      this.getCommentData();
      this.onClose();
    });
    // 用户可选订阅消息提醒，主讲人回复用户时，用户会有微信推送
    // 这个地方 PC 模拟器会提示 "requestSubscribeMessage:fail can only be invoked by user TAP gesture."
    // 但是手机是正常的
    wx.requestSubscribeMessage({
      tmplIds: [template_id],
      success(res) {
        console.log(res)
        wx.showToast({
          title: "留言成功 主讲人回复时会有微信推送",
          icon: "none"
        });
      },
      fail(res) {
        console.log(res)
      }
    });
  },

  // 管理员/主讲人回复留言
  reSubmit: function (e) {
    if (this.invalid_comment(e.detail.value.commentInput)) {
      wx.showToast({
        title: '回复不能为空',
        icon: 'none'
      });
      return;
    }
    // 上传回复到数据库
    db.collection("comment_info").doc(this.data.reply_message_id).update({
      data: {
        reply: e.detail.value.commentInput
      },
    }).then(res => {
      console.log(res)
      wx.showToast({
        title: "回复成功",
        icon: "success"
      });
      this.setData({
        comment_text: ""
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
              value: e.detail.value.commentInput
            }, // 回复内容
            name3: {
              value: app.globalData.username
            }, // 回复者名字
          },
          templateId: template_id,
          // id: this.data.reply_message_id,
          userId: this.data.replyUserId, // 推送的对象
          page: `pages/activities/activities_detail/activities_detail?id=${app.globalData.current_activity._id}` // 用户点击推送后跳转的页面
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

  // 点赞
  tapLike: function (e) {
    let comment_list = this.data.comment_list;
    let commentid = e.currentTarget.dataset.commentid;
    let comment_index = comment_list.findIndex(item => item._id == commentid);

    if (comment_list[comment_index].current_user_like == false) {
      // 点赞
      comment_list[comment_index].current_user_like = true;
      comment_list[comment_index].like_count++;
      this.setData({
        comment_list
      });
      db.collection("comment_info").doc(commentid).update({
        data: {
          like_list: _.addToSet(app.globalData.openid),
          like_count: _.inc(1)
        }
      });
    } else {
      // 取消点赞
      comment_list[comment_index].current_user_like = false;
      comment_list[comment_index].like_count--;
      this.setData({
        comment_list
      });
      db.collection("comment_info").doc(commentid).update({
        data: {
          like_list: _.pull(app.globalData.openid),
          like_count: _.inc(-1)
        }
      });
    }
  },

  // 置顶
  toTop: function (e) {
    let top = !e.currentTarget.dataset.commentdata.top;
    db.collection("comment_info").doc(e.currentTarget.dataset.commentid).update({
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
          // console.log(e.currentTarget.dataset.commentid)
          db.collection('comment_info').doc(e.currentTarget.dataset.commentid).remove()
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

  // 获取评论数据
  getCommentData: function (e) {
    // console.log('getting data')
    db.collection("comment_info").where({
        activity_id: app.globalData.current_activity._id
      }).orderBy(
        'top', 'desc'
      ).orderBy(
        'like_count', 'desc'
      ).get()
      .then(res => {
        let comment_list = res.data;
        // 计算当前用户是否点过赞
        comment_list.forEach(item => {
          if (item.like_list != undefined)
            item.current_user_like = item.like_list.includes(app.globalData.openid)
          else
            item.current_user_like = false;
        });
        // console.log(res)
        this.setData({
          comment_list: comment_list,
          loading_comment: false
        })
      })
  },

  //监听记录输入字数
  inputText: function (e) {
    let value = e.detail.value;
    value = value.substr(0, this.data.max_number);
    let len = value.length;
    this.setData({
      'number': len
    })
  },

  //弹出面板设置
  showPopup(e) {
    this.setData({
      show_comment_popup: true,
    });
  },
  onClose() {
    this.setData({
      show_comment_popup: false
    });
  },
  showRe(e) {
    this.setData({
      show_reply_popup: true,
      reply_message_id: e.currentTarget.dataset.commentid,
      replyUserId: e.currentTarget.dataset.userid
    });
  },
  closeRe() {
    this.setData({
      show_reply_popup: false
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
  });
  //设置留言
  that.getCommentData();
}
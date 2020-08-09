// pages/people_selector/people_selector.js
// 该表将三个搜索用户多选的场景写在一个页面中
// 保持主页面逻辑一致和代码复用，同时
// 通过不同的参数调用不同的 js 中的同名函数
// 实现不同的功能

import * as grant_admin from 'scene/grant_admin.js';
import * as check_in_list from 'scene/check_in_list.js';
import * as presenter_list from 'scene/presenter_list.js';
let scene; // 根据 url 设置为上述之一
let i = 0;

let app = getApp();
const db = wx.cloud.database();
var that;

let scene_list = {
  check_in_list: check_in_list,
  presenter_list: presenter_list,
  grant_admin: grant_admin
};

Page({
  data: {
    inputShowed: false,
    inputVal: "",
    checkboxItems: [], // 每一项有 name (学号 姓名), value (openid 值), username, checked
    title: ' - 已选：', // 标题，'XXX - 已选：'
    total: 0 // 已选人数
  },
  onLoad(e) {
    that = this;
    // 检测 modify 参数是否在 scene_list 中
    if (typeof (scene_list[e.modify]) == 'undefined') {
      wx.navigateBack({
        delta: 1,
      });
      wx.showToast({
        title: 'modify 参数错误',
        icon: 'none'
      });
    }
    // 从对应场景名载入对应的 js 文件，实现不同的功能
    scene = scene_list[e.modify]
    // 拒绝错误的状态，并获取当前已选总人数，并且修改标题
    scene.onLoad(e, this);
  },
  showInput: function () {
    this.setData({
      inputShowed: true,
      checkboxItems: {}
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false,
      checkboxItems: {}
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: "",
      checkboxItems: {}
    });
  },
  inputTyping: function (e) {
    if (e.detail.value.length == 0) {
      this.setData({
        checkboxItems: {}
      });
      return;
    }
    // 显示加载的动画，加载完成以后隐藏
    wx.showNavigationBarLoading();
    var that = this;
    let inputVal = e.detail.value;
    this.setData({
      inputVal: inputVal
    });
    // 以输入作为关键字搜索姓名或学号，并以经验值降序排序
    const _ = db.command;
    db
      .collection('user_info')
      .where(
        _.or([{
          username: db.RegExp({
            regexp: inputVal
          })
        }, {
          student_id: db.RegExp({
            regexp: inputVal
          })
        }])
      )
      .orderBy('exp', 'desc')
      .limit(20)
      .get({
        success: res => {
          let checkboxItems = [];
          res.data.forEach(Element => {
            checkboxItems.push({
              name: Element.student_id.padEnd(18, ' ') + Element.username,
              username: Element.username,
              value: Element._id,
              checked: scene.elementIsChecked(Element)
            })
          });
          that.setData({
            checkboxItems: checkboxItems
          });
          wx.hideNavigationBarLoading();
        },
        fail: res => {
          console.log(res);
        }
      });
  },
  checkboxChange: function (e) {
    wx.showNavigationBarLoading();
    let id = e.currentTarget.dataset.id;
    let index = this.data.checkboxItems.findIndex(element => element.value == id);
    // checkboxChange 被触发时尽管 ui 上已经变化
    // 但是并不会改变 this.data.checkboxItems[i].checked 值
    // 获取到的是旧值；还需要手动修改以后 setData
    let checkboxItems = this.data.checkboxItems;
    let checked = !checkboxItems[index].checked;
    // checkboxItems[index].checked = checked;
    // console.log(i++, checkboxItems.map(x => x.checked ? 1 : 0));
    this.setData({
      ['checkboxItems[' + index + '].checked']: checked
    });
    // 调用对应函数
    let startTime = new Date().getTime();
    scene.listChanged({
        userid: id,
        checked: checked,
        username: checkboxItems[index].username
      })
      .then(res => {
        wx.hideNavigationBarLoading();
        let endTime = new Date().getTime();
        res.time = endTime - startTime;
        console.log(res)
        wx.showToast({
          title: '成功' + (checked ? '添加' : '删除') + ' ' + checkboxItems[index].name,
          icon: 'none'
        });
        // 修改 total 值和标题
        this.setData({
          total: this.data.total + (checked ? 1 : -1)
        })
        wx.setNavigationBarTitle({
          title: this.data.title + this.data.total,
        })
      })
      .catch(err => {
        wx.hideNavigationBarLoading();
        console.log(err);
        wx.showToast({
          title: '修改' + checkboxItems[index].name + '失败 请尝试退出后重新修改',
          icon: 'none',
          duration: 5000
        });
        //还得把选项改回来
        that.setData({
          ['checkboxItems[' + index + '].checked']: !checked
        });
      })
  },
});

// // pages/people_selector/people_selector.js
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
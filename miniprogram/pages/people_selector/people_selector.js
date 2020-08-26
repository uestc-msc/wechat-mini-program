// pages/people_selector/people_selector.js
// 该表将三个搜索用户多选的场景写在一个页面中
// 保持主页面逻辑一致和代码复用，同时
// 通过不同的参数调用不同的 js 中的同名函数
// 实现不同的功能

import * as grant_admin from 'scene/grant_admin.js';
import * as check_in_list from 'scene/check_in_list.js';
import * as presenter_list from 'scene/presenter_list.js';
const scene_list = {
  check_in_list: check_in_list,
  presenter_list: presenter_list,
  grant_admin: grant_admin
};
let scene; // 根据 url 设置为上述之一

let app = getApp();
const db = wx.cloud.database();
var that;
let checkbox_items_full = []; // 所有用户的列表，每一项有 name (学号 姓名), value (openid 值), exp, checked

Page({
  data: {
    inputShowed: false,
    inputVal: "",
    checkbox_items: [], // checkboxItemsFull 的子集，根据输入文本 filter
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
    wx.showLoading({
      title: '本薇薇的点名册呢',
    });
    // 从对应场景名载入对应的 js 文件，实现不同的功能
    scene = scene_list[e.modify]
    //读取整个名单和每个人的 checked 状态
    wx.cloud.callFunction({
      name: "get_collection",
      data: {
        collection: 'user_info'
      },
      success: res => {
        checkbox_items_full = res.result.data.map(Element => ({
          name: Element.student_id.padEnd(18, ' ') + Element.username,
          exp: Element.exp,
          value: Element._id,
          checked: scene.elementIsChecked(Element)
        }));
        // 被选中的在前面
        checkbox_items_full.sort(compare_checkbox);
        that.setData({
          checkbox_items: checkbox_items_full
        });
        wx.hideLoading();
      },
      fail: res => {
        wx.showToast({
          title: '读取数据库失败',
          icon: 'none'
        });
        wx.navigateBack({
          delta: 1,
        });
      }
    })
    // 拒绝错误的状态，并获取当前已选总人数，并且修改标题
    scene.onLoad(e, this);

  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  // 取消按钮
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
    this.clearInput();
  },
  // 输入框旁的小×，或者当输入字符为空时也会触发
  clearInput: function () {
    checkbox_items_full.sort(compare_checkbox);
    this.setData({
      inputVal: "",
      checkbox_items: checkbox_items_full
    });
  },
  // 输入框变化
  inputTyping: function (e) {
    if (e.detail.value.length == 0) {
      this.clearInput();
      return;
    }
    that = this;
    let inputVal = e.detail.value;
    this.setData({
      inputVal: inputVal
    });
    // 以输入作为关键字搜索姓名或学号
    that.setData({
      checkbox_items: checkbox_items_full.filter(Element => Element.name.includes(inputVal))
    });
  },
  checkboxChange: function (e) {
    wx.showNavigationBarLoading();
    let id = e.currentTarget.dataset.id;
    let index = this.data.checkbox_items.findIndex(element => element.value == id);
    // checkboxChange 被触发时尽管 ui 上已经变化
    // 但是并不会改变 this.data.checkboxItems[i].checked 值
    // 获取到的是旧值；还需要手动修改以后 setData
    let checkbox_items = this.data.checkbox_items;
    let checked = !checkbox_items[index].checked;
    // 还要修改 checkbox_items_full 和 checkbox_items 的对应 checked 值
    let index2 = checkbox_items_full.findIndex(element => element.value == id);
    checkbox_items_full[index2].checked = checked;
    this.setData({
      ['checkbox_items[' + index + '].checked']: checked
    });
    // 调用对应函数
    let startTime = new Date().getTime();
    scene.listChanged({
        user_id: id,
        checked: checked,
        username: checkbox_items[index].username
      })
      .then(res => {
        wx.hideNavigationBarLoading();
        let endTime = new Date().getTime();
        res.time = endTime - startTime;
        console.log(res)
        wx.showToast({
          title: '成功' + (checked ? '添加' : '删除') + ' ' + checkbox_items[index].name,
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
          title: '修改' + checkbox_items[index].name + '失败 请尝试退出后重新修改',
          icon: 'none',
          duration: 5000
        });
        // 出错了还得把选项改回来
        that.setData({
          ['checkboxItems[' + index + '].checked']: !checked
        });
      })
  },
});

/**
 * 排序算法：先按选中状态排序（选中的在前），否则按经验降序排序
 * @returns 若返回值大于 0，则第二个元素应该在前
 */
function compare_checkbox(a, b) {
  if (a.checked != b.checked)
    return b.checked - a.checked;
  else
    return b.exp - a.exp;
}
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
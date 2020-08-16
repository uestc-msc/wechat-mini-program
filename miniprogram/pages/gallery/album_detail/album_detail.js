// pages/gallery/gallery_detail/gallery_detail.js

import getActivityInfo from '../../utils/get_activity_info.js';
import sleep from '../../utils/sleep.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    activities_arr: [],
    activities_length: 0,
    photos: [],
    currentAlbum: null,
    fullScreenPhotoUrl: null,
    can_upload: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let app = getApp();
    this.photoDB = wx.cloud.database().collection('album_info');
    this.page_index = 0;
    this.activities_per_page = 20;
    this.activities_total = 0;
    this.setData({
      can_upload: app.globalData.can_upload
    });
    // 获取前 activities_per_page 个活动
    this.loadOnePage();
    // 获取活动总数
    wx.cloud.database().collection('activity_info')
      .where({
        is_hidden: false
      })
      .count()
      .then(res => {
        this.activities_total = res.total;
        //如果不满足 if 应该直接跳到某个相册
        if (app.globalData.current_activity == undefined ||
          app.globalData.current_activity._id == undefined) {
          this.setData({
            title: `相册(${this.activities_total})`
          })
        }
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let app = getApp();
    if (app.globalData.current_activity != undefined &&
      app.globalData.current_activity._id != undefined) {
      this.setData({
        currentAlbum: app.globalData.current_activity,
        title: app.globalData.current_activity.title
      })
      this.showPhotos(app.globalData.current_activity._id);
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    let current_activity = getApp().globalData.current_activity;
    if (current_activity == undefined || )
    this.setData({
      activities_arr: []
    })
    this.onLoad();
    sleep(500).then(() => {
      wx.stopPullDownRefresh()
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    this.loadOnePage();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  loadOnePage() {
    const db = wx.cloud.database();
    //获取前 activities_per_page 个活动信息
    wx.showLoading({
      title: '加载中'
    });
    getActivityInfo({
        skip: this.page_index * this.activities_per_page,
        limit: this.activities_per_page,
      })
      .then(res => {
        wx.hideLoading();
        if (res == undefined || res.length == 0) {
          wx.showToast({
            title: '本薇薇也是有底线的',
            icon: 'none'
          });
        } else {
          this.setData({
            ['activities_arr[' + this.page_index + ']']: Array.from(res)
          });
          this.page_index++;
        }
      })
      .catch(err => {
        console.log(err);
        wx.showToast({
          title: '数据出错啦 _(:з」∠)_',
          icon: 'none'
        });
      })
  },

  tapAlbum: function (event) {
    const item = event.currentTarget.dataset.item;
    // console.warn(item)
    this.setData({
      currentAlbum: item,
      title: item.title,
      photos: []
    })
    this.showPhotos(item._id)
  },

  // tapPhoto: funtion (event) {

  // }
  addPhoto: function () {
    const that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: res => {
        const imagePath = res.tempFilePaths[0]
        console.warn(imagePath)
        wx.cloud.uploadFile({
          filePath: imagePath,
          cloudPath: `${Math.random()}_${Date.now()}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
          success: res => {
            console.warn('图片上传成功')
            that.photoDB.add({
              data: {
                url: res.fileID,
                album_id: that.data.currentAlbum._id
              },
              success: res => {
                wx.showToast({
                  title: '上传成功',
                });
                that.showPhotos(that.data.currentAlbum._id)
              },
              fail: err => {
                console.error(err)
              }
            })
          },
        })
      }
    })
  },
  showPhotos: function (album_id) {
    let app = getApp();
    app.globalData.current_activity._id = album_id;
    wx.showNavigationBarLoading();
    this.photoDB
      .where({
        album_id
      })
      .get({
        success: res => {
          this.setData({
            photos: res.data
          });
          wx.hideNavigationBarLoading();
        }
      })
  },
  touchStartPhoto: function (e) {
    this.startTap = Date.now();
  },
  tapPhoto: function (e) {
    if (Date.now() - this.startTap < 350) { // 350ms 以上判定为长按，参考 https://developers.weixin.qq.com/miniprogram/dev/framework/view/wxml/event.html
      let that = this;
      wx.previewImage({
        current: e.currentTarget.dataset.item.url,
        urls: that.data.photos.map(Element => Element.url)
      });
    }
  },
  longPressPhoto: function (e) {
    let photo = e.currentTarget.dataset.item;
    let app = getApp();
    if (app.globalData.is_admin || photo._openid == app.globalData.openid) { // 有权限删除
      wx.showActionSheet({
        itemList: ['删除图片'],
        itemColor: 'red',
        success: res => {
          console.log(photo)
          wx.cloud.database().collection('album_info').doc(photo._id).remove()
          .then(res => {
            console.log(res);
            return wx.cloud.deleteFile({
              fileList: [photo.url]
            });
          })
          .then(res => {
            console.log(res);
            wx.showToast({
              title: '删除成功',
            })
            // 2fasadf // mark: xxx
          })
        }
      })
    } else {
      wx.showToast({
        title: '没有权限删除这张图片',
        icon: 'none'
      })
    }

  },
  tapBack: function () {
    getApp().globalData.current_activity = {};
    this.setData({
      currentAlbum: null,
      title: `相册(${this.activities_total})`
    })
  },
})
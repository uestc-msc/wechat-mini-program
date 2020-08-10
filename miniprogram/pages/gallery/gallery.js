// pages/gallery/gallery.js

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
    fullScreenPhotoUrl: null
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
    // 获取前 activities_per_page 个活动
    this.loadOnePage();
    // 获取活动总数
    wx.cloud.database().collection('activity_info')
      .where({
        is_hidden: false
      })
      .count()
      .then(res => {
        console.log(res.total);
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
      app.globalData.current_activity._id != undefined)
      this.setData({
        currentAlbum: app.globalData.current_activity,
        title: app.globalData.current_activity.title
      })
    this.showPhotos(app.globalData.current_activity._id);
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
      title: '加载中',
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
    const item = event.currentTarget.dataset.item
    console.warn(item)
    this.setData({
      currentAlbum: item,
      title: item.title
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
    this.photoDB
      .where({
        album_id
      })
      .get({
        success: res => {
          this.setData({
            photos: res.data
          })
        }
      })
  },
  tapPhotoToMaximize: function (e) {
    this.setData({
      fullScreenPhotoUrl: e.currentTarget.dataset.item.url
    })
  },
  tapPhotoToMinimize: function (e) {
    this.setData({
      fullScreenPhotoUrl: null
    })
  },
  tapBack: function () {
    getApp().globalData.current_activity = {};
    this.setData({
      currentAlbum: null,
      title: `相册(${this.activities_total})`
    })
  },
  downloadPhoto() {
    let that = this;
    wx.authorize({
      scope: "scope.writePhotosAlbum",
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
              title: '保存失败 _(:з」∠)_',
              icon: 'none'
            })
          }
        })
      },
      fail: err => {
        console.log(err)
        wx.showToast({
          title: '没有写入相册的权限 _(:з」∠)_',
          icon: 'none'
        })
      }
    })
  },
})
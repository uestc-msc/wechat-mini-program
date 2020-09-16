// pages/gallery/gallery_detail/gallery_detail.js
import sleep from '../../../utils/sleep.js'
import getActivityInfo from '../../../utils/get_activity_info.js'
import bytesToString from '../../../utils/bytes_to_string.js'
import log from '../../../utils/log.js'
import add_exp, * as const_exp from '../../../utils/add_exp';

const app = getApp();
const db = wx.cloud.database();
let last_photo_index = 0;   // 目前展示的最后一张图片的下标
const photos_per_page = 20; // 一次下拉展示这么多照片，不一次加载完是为了省流量
let photos_arr = [];        // 所有图片
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    photos_total: '',
    photos_arr: [],       // 当前展示的图片
    can_upload: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.showLoading({
      title: '这次又有谁的黑照呢',
    })
    that = this;
    // 判断链接错误
    if (options.album_id == undefined) {
      wx.switchTab({
        url: '/pages/gallery/gallery',
      });
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      return;
    }
    // 尝试从全局变量中读取是否有该次活动的信息，如果有就先默认填上
    if (typeof (app.globalData.current_activity) != 'undefined' && app.globalData.current_activity._id == options.album_id) {
      this.setData({
        title: app.globalData.current_activity.title
      });
    } else {
      app.globalData.current_activity._id = options.album_id;
    }
    // 从数据库获取活动最新数据以后再覆盖
    getActivityInfo({
        id: options.album_id,
      })
      .then(res => {
        let cur = res[0];
        app.globalData.current_activity = cur;
        that.setData({
          title: app.globalData.current_activity.title
        });
      });
    this.setData({
      can_upload: app.globalData.app_settings.can_upload
    });
    wx.cloud.callFunction({
      name: 'get_collection',
      data: {
        collection: 'album_photo_list',
        id: options.album_id
      },
      success: res => {
        photos_arr = res.result.data;
        that.setData({
          photos_total: photos_arr.length
        });
        wx.hideLoading();

        // 清空数据
        last_photo_index = 0;
        // 呈现前 photos_per_page 张照片
        return this.loadOnePage();
      },
      fail: err => {
        console.log(err);
        wx.showToast({
          title: '数据出错啦 _(:з」∠)_',
          icon: 'none'
        });
        return err;
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
    this.onLoad({
        album_id: app.globalData.current_activity._id
      })
      .finally(() => {
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

  async loadOnePage() {
    last_photo_index += photos_per_page;
    this.setData({
      photos_arr: photos_arr.slice(0, last_photo_index)
    });
  },

  // tapPhoto: funtion (event) {

  // }
  addPhoto: function () {
    const that = this
    //选择图片
    wx.chooseImage({
      count: 9,
      sizeType: ['compressed', 'original'],
      sourceType: ['album', 'camera'],
      success: res => {
        const user_id = app.globalData.openid;
        const album_id = app.globalData.current_activity._id;
        let current_uploading_n = 1;
        const total_uploading_n = res.tempFilePaths.length;
        wx.showLoading({
          title: '正在上传：' + current_uploading_n + '/' + total_uploading_n,
        })
        res.tempFilePaths.forEach((imagePath, index) => {
          //上传每一张图片
          wx.cloud.uploadFile({
            filePath: imagePath,
            cloudPath: `album/${album_id}/${Date.now()}_${user_id}_${index}.${imagePath.match(/\.(\w+)$/)[1]}`,
            success: res => {
              // 向数据库写入已上传照片的信息，每上传一张写一次
              db.collection('album_info').add({
                  data: {
                    url: res.fileID,
                    album_id: app.globalData.current_activity._id
                  },
                })
                .then(res2 => {
                  // 在本地更新数据
                  // console.log(res2)
                  photos_arr.unshift({
                    _id: res2._id,
                    _openid: app.globalData.openid,
                    url: res.fileID,
                    album_id: app.globalData.current_activity._id
                  });
                  // 在最前面添加刚上传的照片
                  last_photo_index++;
                  that.setData({
                    photos_total: that.data.photos_total + 1,
                    photos_arr: photos_arr.slice(0, last_photo_index)
                  })
                  // 如果不是上传的最后一张，显示正在上传第 x 张
                  if (current_uploading_n != total_uploading_n) {
                    current_uploading_n++;
                    wx.showLoading({
                      title: '正在上传：' + current_uploading_n + '/' + total_uploading_n,
                    })
                  } else {
                    //如果是最后一张，显示上传成功，经验增加
                    let exp = const_exp.photo * total_uploading_n;
                    wx.showToast({
                      title: '经验+' + exp,
                    });
                    // 加经验
                    add_exp(app.globalData.openid, exp);
                  }
                })
                .catch(err => {
                  console.error(err)
                })
            },
          })
        });
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
        urls: that.data.photos_arr.map(Element => Element.url)
      });
    }
  },
  longPressPhoto: function (e) {
    let that = this;
    let photo = e.currentTarget.dataset.item;
    if (app.globalData.is_admin || // 管理员
      photo._openid == app.globalData.openid || // 图片上传者
      app.globalData.current_activity.presenter_list.includes(app.globalData.openid)) { // 活动主讲人
      wx.showActionSheet({
        itemList: ['删除图片'],
        itemColor: '#FF3030',
        success: res => {
          // console.log(photo)
          wx.cloud.database().collection('album_info').doc(photo._id).remove()
            .then(res => {
              // console.log(res);
              return wx.cloud.deleteFile({
                fileList: [photo.url]
              });
            })
            .then(res => {
              // console.log(res);
              wx.showToast({
                title: '删除成功',
              })
              // 扣上传者的经验
              add_exp(photo._openid, -const_exp.photo);
              // 在客户端删除
              let deleted_index = photos_arr.findIndex(Element => Element._id == photo._id);
              photos_arr.splice(deleted_index, 1); // 删除一个元素
              that.setData({
                photos_arr: photos_arr,
                photos_total: that.data.photos_total - 1
              })
              // 记录日志
              log({
                oper: 'delete_photo',
                data: {
                  item: e.currentTarget.dataset.item
                }
              });
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
})
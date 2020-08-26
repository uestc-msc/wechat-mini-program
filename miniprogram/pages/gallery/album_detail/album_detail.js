// pages/gallery/gallery_detail/gallery_detail.js
import sleep from '../../../utils/sleep.js'
import getActivityInfo from '../../../utils/get_activity_info.js'
import bytesToString from '../../../utils/bytes_to_string.js'
import log from '../../../utils/log.js'
import add_exp, * as const_exp from '../../../utils/add_exp';

const app = getApp();
const db = wx.cloud.database();
let page_index = 0;
const photos_per_page = 20;
let photos_arr = [];
var that;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    photos_total: '',
    photos_arr: [],
    can_upload: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
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
    // 从数据库获取最新数据以后再覆盖
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
      can_upload: app.globalData.can_upload
    });
    // 获取 photos 总数
    db.collection('album_info')
      .where({
        album_id: options.album_id
      })
      .count()
      .then(res => {
        this.setData({
          photos_total: res.total
        });
      });
    // 清空数据
    page_index = 0;
    photos_arr = [];
    that.setData({
      photos_arr: []
    });
    // 获取前 photos_per_page 个活动
    return this.loadOnePage();
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
    //获取前 photos_per_page 个活动信息
    wx.showLoading({
      title: '加载中'
    });
    return db.collection('album_info')
      .where({
        album_id: app.globalData.current_activity._id
      })
      .orderBy('url', 'desc')
      .skip(page_index * photos_per_page)
      .limit(photos_per_page)
      .get()
      .then(res => {
        wx.hideLoading();
        if (res.data == undefined || res.data.length == 0) {
          wx.showToast({
            title: '本薇薇也是有底线的',
            icon: 'none'
          });
        } else {
          Array().push.apply(photos_arr, res.data);
          this.setData({
            photos_arr: photos_arr
          });
          page_index++;
        }
      })
      .catch(err => {
        console.log(err);
        wx.hideLoading();
        wx.showToast({
          title: '数据出错啦 _(:з」∠)_',
          icon: 'none'
        });
      })
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
        let user_id = app.globalData.openid;
        let album_id = app.globalData.current_activity._id;
        const uploadTask = wx.cloud.uploadFile({
          filePath: imagePath,
          cloudPath: `album/${album_id}/${Date.now()}_${user_id}.${res.tempFilePaths[0].match(/\.(\w+)$/)[1]}`,
          success: res => {
            wx.showLoading({
              title: '写入数据库中',
              mask: 'true'
            })
            db.collection('album_info').add({
              data: {
                url: res.fileID,
                album_id: app.globalData.current_activity._id
              },
              success: res2 => {
                wx.showToast({
                  title: '经验+' + const_exp.photo,
                });
                // 加经验
                add_exp(app.globalData.openid, const_exp.photo);
                // 在本地更新数据
                // console.log(res2)
                photos_arr.unshift({
                  _id: res2._id,
                  _openid: app.globalData.openid,
                  url: res.fileID,
                  album_id: app.globalData.current_activity._id
                });
                that.setData({
                  photos_total: that.data.photos_total + 1,
                  photos_arr: photos_arr
                })
              },
              fail: err => {
                console.error(err)
              }
            })
          },
        })
        uploadTask.onProgressUpdate((res) => {
          wx.showLoading({
            title: bytesToString(res.totalBytesSent) +
              '/' + bytesToString(res.totalBytesExpectedToSend),
            mask: 'true'
          });
        })
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
    if (app.globalData.is_admin ||                                                      // 管理员
      photo._openid == app.globalData.openid ||                                         // 图片上传者
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
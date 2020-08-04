// pages/gallery/gallery.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    activities: [],
    photos: [],
    currentAlbum: null,
    photoDB: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
    this.photoDB = wx.cloud.database().collection('album_info')
    const db = wx.cloud.database()
    db
      .collection('activity_info')
      .orderBy('date', 'desc')
      .orderBy('time', 'desc')
      .get({
        success: res => {
          let activities = Array.from(res.data);
          
          this.setData({
            activities,
            title: `相册(${activities.length})`
          })
          console.warn(this.data.activities)
        },
        fail: err => {
          console.log(err);
          wx.showToast({
            title: '获取活动数据失败',
            icon: 'none'
          });
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
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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
      .where ({album_id})
      .get ({
        success: res => {
          this.setData({
            photos: res.data
          })
        }
      })
  },
  tapBack: function () {
    this.setData({
      currentAlbum: null,
      title: `相册(${this.data.activities.length})`
    })
  }
})

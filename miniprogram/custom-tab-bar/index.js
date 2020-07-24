Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#3cc51f",
    list: [
      {
        pagePath: "../activities/activities",
        iconPath: "../images/icon_date.png",
        selectedIconPath: "../images/icon_date_filling.png",
        text: "活动"
      },
      {
        pagePath: "../gallery/gallery",
        iconPath: "../images/icon_gallery.png",
        selectedIconPath: "../images/icon_gallery_filling.png",
        text: "相册"
      },
      {
        pagePath: "../user/user",
        iconPath: "../images/icon_user.png",
        selectedIconPath: "../images/icon_user_filling.png",
        text: "我"
      }
    ]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    }
  }
})
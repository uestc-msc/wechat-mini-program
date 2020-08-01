//app.js
App({
    onLaunch: function () {
      var that = this;

      if (!wx.cloud) {
        console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      } else {
        wx.cloud.init({
          // env 参数说明：
          //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
          //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
          //   如不填则使用默认环境（第一个创建的环境）
          env: 'uestc-msc-activities',
          traceUser: true,
        })
      }

      this.globalData = {
        openid: "",
        avatar_url: "",
        name: "",
        school_id: "",
        telephone: "",
        is_admin: false,
        register_date: "",
        exp: 0
      }

      //获取 openid 并查询数据库中是否有该人信息
      wx.cloud.callFunction({
        name: "login",
        data: {},
        success(e) {
          // console.log(e)
          that.globalData.openid = e.result.openid;
          //查询数据库
          const db = wx.cloud.database()
          // 查询当前用户所有的 counters
          db.collection('user_info').where({
            _openid: that.globalData.openid
          }).get({
            success: res => {
              // console.log('res:', res);
              if (res.data.length == 0) // 数据库中没有该用户的信息
              {
                wx.reLaunch({
                  url: '/pages/init_user/init_user',
                });
                return;
              } else {
                this.globalData.avatar_url;
                this.globalData.name;
                this.globalData.school_id;
                this.globalData.telephone;
                this.globalData.is_admin;
                this.globalData.register_date;
              }
            },
            fail: err => {
              wx.showToast({
                title: '查询user_info数据库失败\n请联系管理员',
                icon: 'none'
              })
            }
          })
        },
        fail(e) {
          wx.showToast({
            title: '获取 openid 失败\n请联系管理员',
            icon: 'none'
          })
        }
      })
    }
  })

  /**
   * 全局分享配置，页面无需开启分享
   * 使用隐式页面函数进行页面分享配置
   * 使用隐式路由获取当前页面路由，并根据路由来进行全局分享、自定义分享
   * 来源：https://www.cnblogs.com/xyyt/p/12614181.html
   */
  ! function () {
    //获取页面配置并进行页面分享配置
    var PageTmp = Page
    Page = function (pageConfig) {
      //1. 获取当前页面路由
      let routerUrl = ""
      wx.onAppRoute(function (res) {
        //app.js中需要在隐式路由中才能用getCurrentPages（）获取到页面路由
        let pages = getCurrentPages(),
          view = pages[pages.length - 1];
        routerUrl = view.route
      })

      //2. 全局开启分享配置
      pageConfig = Object.assign({
        onShareAppMessage: function () {
          //根据不同路由设置不同分享内容（微信小程序分享自带参数，如非特例，不需配置分享路径）
          let shareInfo = {}
          let noGlobalSharePages = ["index/index"]
          //全局分享配置，如部分页面需要页面默认分享或自定义分享可以单独判断处理
          if (!routerUrl.includes(noGlobalSharePages)) {
            shareInfo = {
              title: "阮薇薇点名啦",
              imageUrl: wx.getStorageSync("shareUrl")
            }
          }
          return shareInfo
        }
      }, pageConfig);
      // 配置页面模板
      PageTmp(pageConfig);
    }
  }();
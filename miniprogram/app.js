//app.js
App({
    onLaunch: function () {
      const that = this;
      this.globalData = {
        app_version: "v1.2.1",
        can_upload: false, // 禁止添加活动、上传图片

        openid: "",
        // 如果数据库发现没有用户信息，应使 avatar_url 为空
        avatar_url: '/images/icon_ruanweiwei.png',
        username: "",
        student_id: "",
        telephone: "",
        is_admin: false,
        can_grant_admin: false,
        register_date: "",
        exp: 0,

        current_activity: {} //在几个页面中传递的当前活动的对象
      }

      //初始化云服务
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
      //获取 openid 并查询数据库中是否有该人信息
      wx.cloud.callFunction({
        name: "login",
        data: {},
        success(e) {
          // console.log(e)
          that.globalData.openid = e.result.openid;
          that.get_user_info();
        },
        fail(err) {
          console.log(err);
          wx.showToast({
            title: '获取 openid 失败 _(:з」∠)_',
            icon: 'none'
          })
        }
      });

      // ios 端没有 Promise.finally()，需要自己定义
      Promise.prototype.finally = function (callback) {
        let P = this.constructor;
        return this.then(
          value => P.resolve(callback()).then(() => value),
          reason => P.resolve(callback()).then(() => {
            throw reason
          })
        );
      };
    },
    async get_user_info() {
      const that = this;
      const db = wx.cloud.database()
      // 查询是否可以上传
      db.collection('app_info')
        .doc('settings')
        .get()
        .then(res => {
          this.globalData.can_upload = res.data.can_upload
        });
      //查询数据库
      return db.collection('user_info').doc(
          that.globalData.openid
        ).get()
        .then(res => {
          // console.log('res:', res);
          // 每次登陆都要更新头像 url
          wx.getUserInfo({
            success: res2 => {
              // console.log(res2);
              if (res2.userInfo.avatarUrl != res.data.avatar_url)
                db.collection('user_info').doc(
                  that.globalData.openid
                ).update({
                  data: {
                    avatar_url: res2.userInfo.avatarUrl
                  }
                })
            },
          })
          // 将已有的信息存为全局变量
          that.globalData.avatar_url = res.data.avatar_url;
          that.globalData.username = res.data.username;
          that.globalData.student_id = res.data.student_id;
          that.globalData.telephone = res.data.telephone;
          that.globalData.is_admin = res.data.is_admin;
          that.globalData.can_grant_admin = res.data.can_grant_admin;
          that.globalData.register_date = res.data.register_date;
          that.globalData.exp = res.data.exp;
          return res;
        })
        .catch(err => {
          // 用户完善信息前应使 avatar_url 为空
          getApp().globalData.avatar_url = "";
          wx.reLaunch({
            url: '/pages/init_user/init_user',
          });
          return err;
        })
    },
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
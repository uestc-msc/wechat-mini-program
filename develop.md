# 项目开发文档

## 功能、界面描述

### 近期活动页面

路径：`pages/activities/activities`

展示前几次活动、“查看更多”。以及“创建活动”按钮、“签到”按钮。

点击某次活动进入其活动详情页面。

### 所有活动页面

路径：`pages/activities/activities_all/activities_all`

查看所有活动。

由于微信小程序查询数据库只能返回 20 个记录，因此需要分页查询，一页 20 个活动。函数大致逻辑如下：

* `loadOnePage`：读取目前页码 `page_index`，然后向数据库查询 `[page_index*20, (page_index+1)*20)` 范围的活动，并追加到 `activities_arr` 数组，最后 `page_index++`。
* `onLoad` 进入页面：设置 `page_index` 为 0、`activities_arr` 为空，然后 `loadOnePage`。
* `onPullDownRefresh` 下拉刷新：调用 `onLoad`。
* `onReachBottom` 上拉触底加载更多：调用 `loadOnePage`。

点击一次活动进入其活动详情页面。

### 活动详情页面

路径：`pages/activities/activities_detail/activities_detail`

点进卡片显示该次活动的：

* 签到按钮（扫码签到，二维码内容为活动的 uuid）
* 查看名称、主讲人、时间、地点、已签到人数（但不能看到名单）
* 该次活动的公共相册（及上传方法、删除自己上传的图片）
* 管理员界面

### 活动详情（管理员）界面

详情页路径：`pages/activities/activities_detail_admin/activities_detail_admin`

* 修改名称、主讲人、日期、时间、地点、已签到人数
* 签到二维码生成（及下载）
* 手动为用户签到
* 查看、导出签到名单
* 从签到名单里进行抽奖

#### 新增活动界面

路径：`pages/activities/create_activity/create_activity`

设置时间、地点、管理员设置开展人。

### 相册界面

路径：`pages/gallery/gallery`

按活动分类展示相册。由于可能有超过 20 个活动，这里的处理逻辑与[所有活动页面](#所有活动页面)类似。

#### 相册详情界面

路径：`pages/gallery/gallery`

展示单次活动的图片。由于一个活动可能有超过 20 个图片，这里的处理逻辑与[所有活动页面](#所有活动页面)类似。

### 个人管理界面

路径：`pages/user/user`

* 展示头像及经验
* 修改个人信息，路径：`pages/user/modify_information/modify_information`
* 管理员名单修改（仅管理员可以看到），路径：`/pages/people_selector/people_selector?modify=grant_admin`
* 关于，路径 `pages/about/about`

#### 管理员列表

#### 关于

路径：`pages/user/about/about`

### 搜索用户页面

路径：`pages/people_selector/people_selector.js`

该表将三个搜索用户多选的场景写在一个页面中，保持主页面逻辑一致和代码复用，同时通过不同的参数（`/pages/people_selector/people_selector?modify=${scene}`）调用不同的 js 中的同名函数，实现不同的功能。

三个场景如下：

场景|`modify` 参数|额外参数
-|-|-
修改活动的签到名单|`check_in_list`|`id`：活动 id
修改活动的主讲人|`presener_list`|`id`：活动 id
修改管理员|`grant_admin`|无

### 底栏

参考：https://developers.weixin.qq.com/miniprogram/dev/extended/weui/tabbar.html

### 签到

签到不需要单写页面，但是为使得多个页面能调用，单独写一个 js 供其他地方调用。

`pages/check_in/check_in.js`

### 初始化用户

路径：`pages/init_user/init_user`

## 数据库结构

微信小程序使用 JSON 数据库。并且提供每日（凌晨）备份，每个备份保留七天。

可从云开发控制台使用代码查询数据库。其语法如[链接](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/read.html)。

数据库创建记录时会自动生成 id，该 id 为 32 位进制字符串。其本质为 string，但以示特殊，下文军用 `id` 类型均指这类字段。

### 用户信息 user_info

每一条记录的字段如下：

字段|值|含义
-|-|-
`_id`|id|本条记录记录的 id，设置为等于 openid
`_openid`|id|微信识别用户的 openid，数据库自带
`avatar_url`|string|头像的链接
`username`|string|姓名
`student_id`|string|学号
`is_admin`|bool|是否为管理员
`can_grant_admin`|bool|能授予别人管理员
`register_date`|string|注册时间
`exp`|int|参加活动/举办活动能获得经验值

### 活动信息 activity_info

每一条记录的字段如下：

字段|值|含义
-|-|-
`_id`|id|本条记录记录的 id，也是本次活动的 id
`_openid`|id|创建者的 openid
`title`|string|标题
`presenter_list`|Array|主讲人的名单（数组，存储每个人的 openid）
`date`|string|活动日期
`time`|string|活动时间
`location`|string|活动地点
`check_in_list`|Array|签到名单（数组，存储每个人的 openid）
`check_in_closed`|bool|管理员是否关闭签到（为空或 `false` 时可以签到；默认为空；该字段不影响管理员手动签到）
`is_hidden`|bool|活动是否被删除（实际上是隐藏）

### 相册信息 album_info

由于照片分类依据是活动，因此 album_id 等价于 activity_id。

每一条记录的字段如下：

字段|值|含义
-|-|-
`_id`|id|本条记录的 id
`_openid`|id|创建者的 openid
`album_id`|id|相册 id，即活动 id
`url`|string|云存储链接

### 操作日志 log

理论上，任何修改数据库的操作都应该被记录到日志中。为节省流量，仅对关键、不经常进行且难易恢复的操作进行日志记录。

每一条记录的字段如下：

字段|值|含义
-|-|-
`_id`|id|本条记录的 id
`_openid`|id|操作者的 openid
`date`|string|操作日期
`time`|string|操作时间
`oper`|string|操作名
`data`|string|相关数据

目前的操作名和相关数据如下：

操作名|相关数据
-|-
`modify_activity`|`before`、`after`
`modify_presenter`|`activity`、`user`、`oper`(`'set'`或`'unset'`)
`delete_activity`|`item`
`modify_userinfo`|`before`、`after`
`modify_admin`|`user`、`oper`(`'set'`或`'unset'`)
`delete_photo`|`item`

### 小程序信息 app_info

该集合中仅有一个记录，其字段如下：

字段|值|含义
`can_upload`|bool|用户是否可以创建活动、上传图片

### 安全规则

数据库的安全规则设定为所有人可读、创建者或管理员可写，即：

```json
{
  "read": true,
  "write": "doc._openid == auth.openid || get(`database.user_info.${auth.openid}`).is_admin == true"
}
```

## 云存储

### 照片

1.1.0 版本后，照片存储格式为 `/album/${活动 id}/${上传时间戳}_${用户 id}.${文件后缀}`。

### 安全规则

云存储的安全规则希望能设定为所有人可读、创建者或管理员可写，即：

```json
{
  "read": true,
  "write": "resource.openid == auth.openid || get(`database.user_info.${auth.openid}`).is_admin == true"
}
```

但是目前云存储安全规则并不支持查询数据库，因此目前采用所有人都可以读写的策略。

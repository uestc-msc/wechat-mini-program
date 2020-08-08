# 项目开发文档

## 功能、界面描述

### 活动页面

路径：`pages/activities/activities`

展示前几次活动、“查看更多”。以及“创建活动”按钮、“签到”按钮。

点击某次活动进入其活动详情页面。

### 查看更多活动页面

路径：`pages/activities/activities_all/activities_all`

查看所有活动。

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
* 签到二维码生成（及下载），[可能需要芝麻小程序二维码器](https://weixin.hotapp.cn/)
* 查看、导出签到名单
* 从签到名单里进行抽奖

#### 新增活动界面

路径：`pages/activities/create_activity/create_activity`

设置时间、地点、管理员设置开展人。

### 相册界面

路径：`pages/gallery/gallery`

* 按活动分展示。
* 提供批量下载。但个人限制次数。

### 个人管理界面

路径：`pages/user/user`

* 展示头像及经验
* 修改个人信息，路径：`pages/user/modify_information/modify_information`
* 管理员名单修改（仅管理员可以看到），路径：`pages/user/modify_admin/modify_admin`
* 关于，路径 `pages/about/about`

#### 管理员列表

#### 关于

路径：`pages/user/about/about`

### 底栏

参考：https://developers.weixin.qq.com/miniprogram/dev/extended/weui/tabbar.html

### 签到

签到不需要单写页面，但是为使得多个页面能调用，单独写一个 js 供其他地方调用。

`pages/check_in/check_in.js`

如果存在 `uuid` 参数，则直接进行签到；否则调用微信扫码功能。

### 初始化用户

路径：`pages/init_user/init_user`

## 数据库结构

微信小程序使用 JSON 数据库。并且提供每日（凌晨）备份，每个备份保留七天。

可从云开发控制台使用代码查询数据库。其语法如[链接](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/database/read.html)。

### 用户信息 user_info

每一条记录的字段如下：

字段|值|含义
-|-|-
`_id`|等于`_openid`|本条记录记录的 id，设置为等于 openid
`_openid`|string|微信识别用户的 openid，数据库自带
`avatar_url`|string|头像的链接
`username`|string|姓名
`student_id`|string|学号
`telephone`|string|电话
`is_admin`|bool|是否为管理员
`can_grant_admin`|bool|能授予别人管理员
`register_date`|string|注册时间
`exp`|int|参加活动/举办活动能获得经验值

### 活动信息 activity_info

每一条记录的字段如下：

字段|值|含义
-|-|-
`_id`||本条记录记录的 id，也是本次活动的 id
`_openid`|string|创建者的 openid
`title`|string|标题
`presenter_list`|[string]|主讲人的名单（列表，存储每个人的 openid）
`date`|string|活动日期
`time`|string|活动时间
`location`|string|活动地点
`check_in_list`|[string]|签到名单（列表，存储每个人的 openid）
`is_hidden`|bool|活动是否被删除（实际上是隐藏）

### 活动签到记录 check_in_list

### 安全规则

数据库的安全规则设定为所有人可读、创建者或管理员可写，即：

```json
{
  "read": true,
  "write": "doc._openid == auth.openid || get(`database.user_info.${auth.openid}`).is_admin == true"
}
```

## 云存储

### 安全规则

云存储的安全规则希望能设定为所有人可读、创建者或管理员可写，即：

```json
{
  "read": true,
  "write": "resource.openid == auth.openid || get(`database.user_info.${auth.openid}`).is_admin == true"
}
```

但是目前云存储安全规则并不支持查询数据库，因此目前采用所有人都可以读写的策略。

## 已知 bug

创建活动、修改活动页，日期、“时间”的字体和“地点”、“标题”的字体不同。

## 长远计划

* 更复杂的抽奖系统
* 活动搜索（主页面和管理员页面都需要有）
* 个人经验等级系统
* 管理员授予勋章

长远计划 x  
没有需求就咕了 √
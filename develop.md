# 项目开发文档

## 功能、界面描述

### 活动页面

路径：`pages/activities/activities`

展示前几次活动、“查看更多”。以及“新增活动”按钮、“扫码签到”按钮。

点击一次活动进入其活动详情页面。

### 查看更多活动页面

路径：`pages/activities/activities_all/activities_all`

查看所有活动。

点击一次活动进入其活动详情页面。

### 活动详情页面

路径：`pages/activities/activities_detail/activities_detail`

点进卡片显示该次活动的：

* 签到按钮（扫码签到，二维码内容为活动的 uuid）
* 查看名称、时间、地点、已签到人数（但不能看到名单）
* 该次活动的公共相册（及上传方法、删除自己上传的图片）
* 删除活动（仅活动创建者/管理员有这个选项）

### 活动详情（管理员）界面

详情页路径：`pages/activities/activities_detail_admin/activities_detail_admin`

* 查看（和修改）名称、时间、地点、已签到人数
* 签到二维码生成（及下载），[可能需要芝麻小程序二维码器](https://weixin.hotapp.cn/)
* 查看、导出签到名单
* 管理图片
* 从参与名单里进行抽奖

#### 新增活动界面

路径：`pages/activities/create_activity/create_activity`

设置时间、地点、管理员设置开展人。

### 相册界面

路径：`pages/gallery/gallery`

* 按活动分展示。
* 提供批量下载。但个人限制次数。

### 个人管理界面

路径：`pages/user/user`

* 展示头像
* 修改个人信息，路径：`pages/user/modify_information/modify_information`
* 管理员名单修改（仅管理员可以看到），路径：`pages/user/modify_admin/modify_admin`
* 关于，路径 `pages/about/about`

### 底栏

参考：

路径：`/tab-bar/tab-bar`

### 签到

签到不需要单写页面，但是为使得多个页面能调用，单独写一个 js 供其他地方调用。

`pages/check_in/check_in.js`

如果存在 `uuid` 参数，则直接进行签到；否则调用微信扫码功能。

### 初始化用户

路径：`pages/init_user/init_user`

## To-do

以上都是

## 长远计划

* 更复杂的抽奖系统
* 活动搜索（主页面和管理员页面都需要有）
* 个人经验等级系统
* 管理员授予勋章
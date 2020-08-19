# wechat-mini-program
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

电子科技大学微软学生俱乐部（UESTC-MSC）的微信小程序，记录每次活动活动的信息。

![小程序码](img/wxacode.jpg)

## 运行环境

基础库 2.9.4，对应微信版本 Android/iOS 7.0.7 及以上。

## 功能介绍

### 签到

签到有三种形式：

* MSCer 在微信-扫一扫中，扫描本次活动对应的小程序码，完成签到；
* MSCer 在小程序中首页或活动详情的“签到”入口，扫描本次活动对应的小程序码，完成签到；
* 管理员在活动管理界面手动为 MSCer 签到。

以上三种签到形式均要求在活动当天进行。前两种形式还要求活动为“开放签到”状态（在活动管理页面设置，默认为开放签到，活动当天可设置）。

### 经验

用户初始经验值为 0。以下行为会增加/扣除经验（正值为增加，反之为扣除）。其他行为（如删除活动）均不会影响经验。

* 一位参与者签到，参与者 +50 经验，每位主讲人 +10 经验。
* 管理员取消某人签到，该人 -50 经验，每位主讲人 -10 经验。
* 设置主讲人时，该人 +10*`已签到人数` 经验
* 取消设置主讲人时，该人 -10*`已签到人数` 经验
* 上传一张图片，上传者 +5 经验。
* 删除一张图片，上传者 -5 经验。

### 权限管理

#### 所有人的权限

所有 MSCers 在完善个人信息后都可以：

* 创建活动
* 查看任意活动的信息
* 扫描某次活动对应的二维码进行签到
* 上传任意活动的照片，照片所有人可见

#### 管理员权限

小程序中存在管理员。管理员的定位为俱乐部副主席。

除上述权限外，管理员拥有的额外权限有：

* 修改活动的信息
* 删除活动
* 获取活动的签到二维码
* 手动为其他用户进行签到
* 开放/关闭通过小程序码的签到（活动当天可设置）
* 查看、导出活动的签到名单
* 删除本次活动的照片

另外，活动的每一位主讲人同样拥有该次活动的以上权限。

管理员权限的修改途径有：

1. 管理员授予者在在小程序中修改
2. 开发者直接修改数据库 `user_info` 集合的 `is_admin` 字段

#### 管理员授予者权限

~~这个名字实在绕口，可是我也没有想到什么更好的名字了，如果有，欢迎提 issue / PR / 私聊开发者~~

小程序中存在管理员授予者 `admin_grantor`。管理员授予者的定位为俱乐部主席。

管理员授予者可以在小程序中修改管理员的名单。

管理员授予者默认不拥有管理员权限。但可以授予自身管理员权限。

管理员授予者只能通过开发者修改数据库 `user_info` 集合的 `can_grant_admin` 字段来修改名单。

### 签到记录导出

由于开发一个页面的时间远大于写几行代码直接查询数据库，再加上这个功能利用率实在太低、变种还可以有很多，因此就不做了。

开发者如有需求，可以参考[文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/Cloud.database.html)，花半天时间自学一下；

其他用户可以私聊开发者。

## 开发

* 微信小程序开发入门教程：https://cloudbase.net/community/guides/handbook/tcb01.html
* 使用 [WeUI](https://github.com/Tencent/weui-wxss) 作为 UI 框架库。使用教程可见：https://cloudbase.net/community/guides/handbook/tcb04.html
* 图标库来自 [weui-icon](https://github.com/weui/weui-icon)

[项目开发文档](develop.md)

## 已知 bug

* activities_all 页和 gallery 页上下颜色不一致（上面为 `#EDEDED`，下面为 `#F6F6F6`）

## 长远计划（由简至难）

* 活动搜索（主页面、相册页面都需要有）
* 管理员授予勋章
* DarkMode

长远计划 x  
没有需求就咕了 √

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/lyh543"><img src="https://avatars2.githubusercontent.com/u/15522311?v=4" width="100px;" alt=""/><br /><sub><b>刘俨晖</b></sub></a><br /><a href="https://github.com/uestc-msc/wechat-mini-program/commits?author=lyh543" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/guyaqi"><img src="https://avatars2.githubusercontent.com/u/26341682?v=4" width="100px;" alt=""/><br /><sub><b>Guyaqi</b></sub></a><br /><a href="https://github.com/uestc-msc/wechat-mini-program/commits?author=guyaqi" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/luosuu"><img src="https://avatars2.githubusercontent.com/u/43507393?v=4" width="100px;" alt=""/><br /><sub><b>Tianle Zhong</b></sub></a><br /><a href="https://github.com/uestc-msc/wechat-mini-program/commits?author=Luosuu" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

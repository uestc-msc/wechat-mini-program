# wechat-mini-program

电子科技大学微软学生俱乐部（UESTC-MSC）的微信小程序，记录每次活动活动的信息。

![小程序码](img/wxacode.jpg)

## 使用

### 签到

签到有三种形式：

* MSCer 在微信-扫一扫中，扫描本次活动对应的小程序码，完成签到；
* MSCer 在小程序中首页或活动详情的“签到”入口，扫描本次活动对应的小程序码，完成签到；
* 管理员在活动管理界面手动为 MSCer 签到。

以上三种签到形式均要求在活动当天进行。

### 经验系统

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
* 查看、导出活动的签到名单
* 删除本次活动的照片

另外，活动的每一位主讲人同样拥有该次活动的以上权限。

管理员权限的修改途径有：

1. 管理员授予者在在小程序中修改
2. 开发者直接修改数据库 `user_info` 集合的 `is_admin` 字段

#### 管理员授予者权限

小程序中存在管理员授予者 `admin_grantor`。管理员授予者的定位为俱乐部主席。

管理员授予者可以在小程序中修改管理员的名单。

管理员授予者默认不拥有管理员权限。但可以授予自身管理员权限。

管理员授予者只能通过开发者修改数据库 `user_info` 集合的 `can_grant_admin` 字段来修改名单。

## 开发

微信小程序开发入门教程：https://cloudbase.net/community/guides/handbook/tcb01.html

使用 [WeUI](https://github.com/Tencent/weui-wxss) 作为 UI 框架库。使用教程可见：https://cloudbase.net/community/guides/handbook/tcb04.html
图标库来自 [weui-icon](https://github.com/weui/weui-icon)

[项目开发文档](develop.md)


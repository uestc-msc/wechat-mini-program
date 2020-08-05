// 监听用户下拉动作：刷新列表
export function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function onPullDownRefresh(page) {
  page.onShow();
  wx.showToast({
    title: '刷新成功',
    icon: 'none'
  })


  sleep(500).then(() => {
    wx.stopPullDownRefresh()
  })
}
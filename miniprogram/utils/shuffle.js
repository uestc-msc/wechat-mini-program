// Shuffle 洗牌算法，用于打乱顺序，抽奖

// 输入：数组 a
// 输出：元素打乱后的数组 a
export default function(a) {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
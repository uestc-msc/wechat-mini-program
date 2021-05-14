// 

/**
 * Shuffle 洗牌算法，用于打乱顺序，抽奖
 * @param `arr` 原数组
 * @returns `arr` 在原数组上修改以后返回其引用
 */
export default function (arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function getCurrentTime(method) {
  const date = new Date()

  const pad = (n, len = 2) => n.toString().padStart(len, "0")

  switch (method) {
    case 1:
      return (
        (date.getFullYear() - 1900).toString() + // 年 - 1900
        date.getMonth().toString() + // 月 - 1 (getMonth 已經是 0~11)
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()) +
        pad(date.getMilliseconds(), 3)
      )
    case 2:
      return (
        date.getFullYear().toString() + // 年
        date.getMonth().toString() + // 月 - 1 (getMonth 0~11)
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()) +
        pad(date.getMilliseconds(), 3)
      )
    default:
      return (
        pad(date.getFullYear(), 4) +
        pad(date.getMonth() + 1) + // Node.js month 0~11 → 補回 1
        pad(date.getDate()) +
        pad(date.getHours()) +
        pad(date.getMinutes()) +
        pad(date.getSeconds()) +
        "." +
        pad(date.getMilliseconds(), 3)
      )
  }
}

console.log(getCurrentTime(2))

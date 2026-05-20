/**
 * 日期工具函数
 */

/** 格式化为 'YYYY-MM-DD' */
export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** 获取今天日期字符串 */
export function today(): string {
  return formatDate(new Date())
}

/** 解析日期字符串为 Date */
export function parseDate(str: string): Date {
  return new Date(str + 'T00:00:00')
}

/** 判断是否是今天 */
export function isToday(dateStr: string): boolean {
  return dateStr === today()
}

/** 相对日期标签 */
export function relativeLabel(dateStr: string): string {
  if (isToday(dateStr)) return `今天 · ${dateStr.slice(5)}`
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  if (dateStr === formatDate(yesterday)) return `昨天 · ${dateStr.slice(5)}`
  return dateStr.slice(5)
}

/** 获取某月天数 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function isMiniProgram(): boolean {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  return false
}

export function isApp(): boolean {
  // #ifdef APP-PLUS
  return true
  // #endif
  return false
}

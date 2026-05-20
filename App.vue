<script lang="ts" setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style lang="scss">
@import 'uni.scss';

page {
  background-color: $bg;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', sans-serif;
  font-size: $body-size;
  color: $text-primary;
}

view, text, input, button {
  box-sizing: border-box;
}
</style>

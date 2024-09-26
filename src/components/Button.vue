<template>
  <Button>按钮</Button>
</template>
<script setup lang="ts">
import { Button } from 'ant-design-vue';
const a = __DEV__;
console.info(a);
</script>
<style lang="scss" scoped>
.ant-btn {
  background-color: red;
}
</style>

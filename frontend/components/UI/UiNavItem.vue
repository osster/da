<template>
  <b-nav-item>
    {{ item.text }}
  </b-nav-item>
</template>

<script>
export default {
  name: 'UiNavItem',
  props: {
    item: {
      type: Object,
      default: () => ({})
    }
  }
}
</script>

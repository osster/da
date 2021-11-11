<template>
  <b-nav vertical>
    <ui-nav-item
      v-for="(item, i) in items"
      :key="i"
      :item="item"
    />
  </b-nav>
</template>

<script>
export default {
  name: 'UiNav',
  props: {
    items: {
      type: Array,
      default: () => ([])
    }
  }
}
</script>

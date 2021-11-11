<template>
  <b-container fluid>
    <b-row>
      <b-col class="col-3">
        <ui-nav :items="items" />
      </b-col>
      <b-col class="col-9">
        <Nuxt />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
export default {
  name: 'Default',
  data () {
    return {
      items: [
        {
          id: 1,
          text: 'Sites',
          childs: []
        }
      ]
    }
  }
}
</script>

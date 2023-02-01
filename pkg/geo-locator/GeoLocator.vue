<script lang="ts">
import Vue from 'vue';

import { NODE } from '@shell/config/types';

// const CLUSTER_ID = 'local';

interface Data {
  nodes: any[],
}

export default Vue.extend<Data, any, any, any>({
  name:   'GeoLocator',
  layout: 'plain',

  data() {
    return { nodes: [] };
  },

  async fetch() {
    this.nodes = await this.$store.dispatch('cluster/findAll', { type: NODE }, { root: true });
  },

  computed: {
    nodeLocations() {
      return this.nodes.map((node: any) => {
        let nodeLocation = { id: node.id };

        for (const key of Object.keys(node.annotations)) {
          if (key.startsWith('geo-locator')) {
            nodeLocation = {
              ...nodeLocation,
              [key.split('.')[1]]: node.annotations[key],
            };
          }
        }

        return nodeLocation;
      });
    },
  }

});

</script>
<template>
  <div class="geo-locator">
    <h1>Geo Locator</h1>
    <br>
    <div v-for="node in nodeLocations" :key="node.id">
      <span>Node: {{ node.id }}</span>
      <br>
      <span>country: {{ node.country }}</span><br>
      <span>region: {{ node.region }}</span><br>
      <span>city: {{ node.city }}</span>
    </div>
  </div>
</template>
<style lang="scss" scoped>
  h1 {
    text-align: center;
  }

  .geo-locator {
    align-items: center;
    display: flex;
    justify-content: center;
  }
</style>

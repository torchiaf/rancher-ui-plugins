<script lang="ts">
import Vue from 'vue';
import * as VueGoogleMaps from 'vue2-google-maps';
import { NODE } from '@shell/config/types';

const CONF = require('./google-api-config.json');

Vue.use(VueGoogleMaps, {
  load: {
    key:       CONF.apiToken,
    libraries: 'places',
  },
});

interface NodeLocation {
  id?: string;
  country?: string;
  region?: string;
  city?: string;
  lat?: string;
  lon?: string;
}

interface Node {
  id: string;
  annotations: Record<string, string>;
}

interface Data {
  nodes: Node[];
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
    googleApi() {
      return (VueGoogleMaps as any).gmapApi();
    },

    nodeLocations() {
      return this.nodes.map((node: Node) => {
        let nodeLocation: NodeLocation = {};

        for (const key of Object.keys(node.annotations)) {
          if (key.startsWith('geo-locator')) {
            const locationKey = (key.split('.') || [])[1];

            if (locationKey) {
              nodeLocation = {
                ...nodeLocation,
                [locationKey]: node.annotations[key],
              };
            }
          }
        }

        return {
          id:     node.id,
          lat:    Number(nodeLocation.lat),
          lon:    Number(nodeLocation.lon),
          title: `${ node.id } \n${ nodeLocation.city } - ${ nodeLocation.region }, ${ nodeLocation.country }`
        };
      });
    },
  }

});

</script>
<template>
  <div class="geo-locator">
    <h1>Geo Locator</h1>
    <br>
    <GmapMap
      :center="{lat:20, lng:-30}"
      :zoom="2"
      map-type-id="terrain"
      style="width: 700px; height: 400px"
    >
      <GmapMarker
        v-for="x in nodeLocations"
        :key="x.id"
        :title="x.title"
        :position="{
          lat: x.lat,
          lng: x.lon,
        }"
      />
    </GmapMap>
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

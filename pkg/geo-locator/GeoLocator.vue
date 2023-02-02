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
    googleApi() {
      return (VueGoogleMaps as any).gmapApi();
    },

    nodeLocations() {
      return this.nodes.map((node: any) => {
        let geoLocator: any = {};

        for (const key of Object.keys(node.annotations)) {
          if (key.startsWith('geo-locator')) {
            const locationKey = (key.split('.') || [])[1];

            if (locationKey) {
              geoLocator = {
                ...geoLocator,
                [locationKey]: node.annotations[key],
              };
            }
          }
        }

        return {
          id:     node.id,
          lat:    Number(geoLocator.lat),
          lon:    Number(geoLocator.lon),
          title: `${ node.id } \n${ geoLocator.city } - ${ geoLocator.region }, ${ geoLocator.country }`
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
    <!-- <span v-for="x in nodeLocations" :key="x.id"> {{ x }}</span> -->
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

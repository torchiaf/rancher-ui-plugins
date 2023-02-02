<script lang="ts">
import Vue from 'vue';
import * as VueGoogleMaps from 'vue2-google-maps';
import { NODE } from '@shell/config/types';
import SortableTable from '@shell/components/SortableTable/index.vue';

const CONF = require('./google-api-config.json');

Vue.use(VueGoogleMaps, {
  load: {
    key:       CONF.apiToken,
    libraries: 'places',
  },
});

interface NodeLocation {
  id: string;
  address?: string;
  country?: string;
  region?: string;
  city?: string;
  lat?: string;
  lon?: string;
  index: number;
}

interface Node {
  id: string;
  annotations: Record<string, string>;
  status: { addresses: { address: string; type: string }[] };
}

interface Data {
  cluster: string;
  nodes: Node[];
  nodeLocationsHeaders: any[];
}

export default Vue.extend<Data, any, any, any>({
  name:   'GeoLocator',
  layout: 'plain',

  components: { SortableTable },

  data() {
    return {
      cluster:              'local',
      nodes:                [],
      nodeLocationsHeaders: [
        {
          name:          'id',
          label:         'Node id',
          value:         'id',
          sort:          'id',
        },
        {
          name:          'address',
          label:         'IP',
          value:         'address',
        },
        {
          name:          'country',
          label:         'Country',
          value:         'country',
          sort:          'country',
        },
        {
          name:          'region',
          label:         'Region',
          value:         'region',
        },
        {
          name:          'city',
          label:         'City',
          value:         'city',
        },
        {
          name:          'lat',
          label:         'Latitude',
          value:         'lat',
        },
        {
          name:          'lon',
          label:         'Longitude',
          value:         'lon',
        },
        {
          name:          'marker',
          label:         'Marker',
        },
      ],
    };
  },

  async fetch() {
    this.nodes = await this.$store.dispatch('cluster/findAll', { type: NODE }, { root: true });
  },

  computed: {
    googleApi() {
      return (VueGoogleMaps as any).gmapApi();
    },

    nodeLocations() {
      return this.nodes
        .filter((node: Node) => node.annotations['geo-locator.lat'] !== undefined && node.annotations['geo-locator.lon'] !== undefined)
        .sort((nodeA: Node, nodeB: Node) => Number(nodeB.id || 0) - Number(nodeA.id || 0))
        .map((node: Node, index: number) => {
          let nodeLocation: NodeLocation = {
            id:      node.id,
            address: node.status.addresses.find(d => d.type === 'InternalIP')?.address,
            index,
          };

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

          return nodeLocation;
        });
    },

    nodeMarkers() {
      return this.nodeLocations.map((nodeLocation: NodeLocation, index: number) => ({
        id:     nodeLocation.id,
        lat:    Number(nodeLocation.lat),
        lon:    Number(nodeLocation.lon),
        title: `${ nodeLocation.id } \n${ nodeLocation.city } - ${ nodeLocation.region }, ${ nodeLocation.country }`,
        icon:  { url: this.icon(nodeLocation.index) },
      }));
    },
  },

  methods: {
    icon(index: number) {
      // TODO add more icons
      return index < 4 ? require(`./assets/icons/${ index + 1 }.png`) : null;
    }
  },
});

</script>
<template>
  <div class="geo-locator">
    <h1>Geo Locator</h1>
    <SortableTable
      class="locations-table"
      :rows="nodeLocations"
      :headers="nodeLocationsHeaders"
      key-field="id"
      :search="false"
      :table-actions="false"
      :row-actions="false"
      :paging="false"
      default-sort-by="id"
    >
      <template #title>
        <div class="table-heading">
          <h2>Cluster:</h2><h2 class="cluster-name">
            {{ cluster }}
          </h2>
        </div>
      </template>
      <template #cell:marker="{row}">
        <div class="markerCell">
          <img :src="icon(row.index)" />
        </div>
      </template>
    </SortableTable>
    <GmapMap
      :center="{lat:20, lng:-10}"
      :zoom="2"
      map-type-id="terrain"
      style="width: 902px; height: 400px"
    >
      <GmapMarker
        v-for="x in nodeMarkers"
        :key="x.id"
        :title="x.title"
        :position="{
          lat: x.lat,
          lng: x.lon,
        }"
        :icon="x.icon"
      />
    </GmapMap>
  </div>
</template>
<style lang="scss" scoped>
  .geo-locator {
    align-items: center;
    display: flex;
    // justify-content: center;
  }

  .locations-table {
    width: 900px;
    margin: 40px;
  }

  .table-heading {
    display: flex;
    flex-direction: row;
    gap: 5px;

    .cluster-name {
      color: var(--link);
    }
  }

  .markerCell {
    text-align: center;
  }
</style>

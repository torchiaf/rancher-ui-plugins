export const name = 'geo-locator';

export function init($plugin, store) {
  const { product } = $plugin.DSL(store, $plugin.name);

  product({
    icon:                  'globe',
    label:                 'Geo Locator',
    inStore:               'management',
    removable:             false,
    showClusterSwitcher:   false,
    category:              'global',
    to:                    { name, params: { cluster: 'local' } }
  });
}

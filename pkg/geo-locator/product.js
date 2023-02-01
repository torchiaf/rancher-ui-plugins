export function init($plugin, store) {
  const { product } = $plugin.DSL(store, $plugin.name);

  product({
    icon:                  'globe',
    label:                 'Geo Locator',
    inStore:               'management',
    removable:             false,
    showClusterSwitcher:   false,
  });
}

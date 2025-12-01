import { defineNuxtModule, createResolver, addServerPlugin } from 'nuxt/kit'

export default defineNuxtModule({
  meta: {
    name: 'dynamic-config',
    configKey: 'dynamicConfig'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    console.info('🔌 Dynamic Config Module enabled')

    // In a full module, we would add the server plugin here:
    // addServerPlugin(resolver.resolve('./runtime/server/plugins/load-config'))

    // But since we are adding this to an existing project, we placed the plugin 
    // directly in server/plugins/load-config.ts for simplicity and auto-discovery.
  }
})

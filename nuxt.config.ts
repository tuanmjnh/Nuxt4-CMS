// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4
  },
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/content',
    '@vueuse/nuxt',
    'nuxt-og-image',
    '@pinia/nuxt',
    'motion-v/nuxt',
    '@nuxtjs/i18n',
    './modules/dynamic-config',
    'nuxt-tiptap-editor',
    '@nuxtjs/sitemap'
  ],

  tiptap: {
    prefix: 'Tiptap', //prefix for Tiptap imports, defaults to Tiptap
  },

  css: ['~/assets/css/main.css'],

  i18n: {
    locales: [
      { code: 'en', iso: 'en-US', name: 'English', file: 'en.json' },
      { code: 'vi', iso: 'vi-VN', name: 'Tiếng Việt', file: 'vi.json' }
    ],
    defaultLocale: 'vi',
    // strategy: 'prefix_except_default',
    // lazy: true,
    langDir: 'locales',
    detectBrowserLanguage: false,
    // detectBrowserLanguage: {
    //   useCookie: true,
    //   cookieKey: 'i18n_redirected',
    //   redirectOn: 'root'
    // }
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-side only)
    mongodb_uri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    mongodb_name: process.env.MONGODB_NAME || 'nuxt4-cms',
    jwt_secret: process.env.JWT_SECRET || '',
    jwt_refresh_secret: process.env.JWT_REFRESH_SECRET || '',
    jwt_expire: process.env.JWT_EXPIRE || '1d',
    jwt_refresh_expire: process.env.JWT_REFRESH_EXPIRE || '30d', // 30 Days
    max_devices_pc: 0, // 0 = unlimited
    max_devices_web: 0, // 0 = unlimited
    max_devices_mobile: 0, // 0 = unlimited
    max_devices_tablet: 0, // 0 = unlimited
    route_load_mode: 'static',
    ffmpeg_configuration_sync: true,
    password_reset: 'Bk123456@',
    split_string: '|;*;|',
    // CLOUDINARY
    cloudinary_cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinary_api_key: process.env.CLOUDINARY_API_KEY || '',
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET || '',
    cloudinary_upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default',
    // GOOGLE
    google_client_id: process.env.GOOGLE_CLIENT_ID || '',     // NUXT_GOOGLE_CLIENT_ID
    google_client_secret: process.env.GOOGLE_CLIENT_SECRET || '', // NUXT_GOOGLE_CLIENT_SECRET
    google_redirect_uri: process.env.GOOGLE_REDIRECT_URI || '',  // NUXT_GOOGLE_REDIRECT_URI

    // Public keys (client-side accessible)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://nuxt.com',
      siteName: 'Nuxt 4 CMS',
      siteIcon: 'i-lucide-layout-dashboard',
      siteDescription: 'A modern content management system built with Nuxt 4',
      copyright: 'tuanmjnh'
    }
  },

  // Nitro configuration for Vercel
  nitro: {
    preset: 'vercel',
    compressPublicAssets: true,
    prerender: {
      routes: [
        '/'
      ],
      crawlLinks: true
    }
  },

  // TypeScript configuration
  typescript: {
    strict: true,
    typeCheck: false, // Disabled to avoid vite-plugin-checker issues, use `nuxt typecheck` manually
    includeWorkspace: true,
    tsConfig: {
      include: [
        '../types/**/*.d.ts',
        '../server/**/*'
      ]
    }
  },

  // Auto-import configuration
  imports: {
    dirs: ['types', 'composables', 'utils']
  },

  // App configuration
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      htmlAttrs: {
        lang: 'vi'
      }
    }
  },
  // disable sourcemap for build
  sourcemap: {
    server: false,
    client: false
  },
  image: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'plus.unsplash.com'],
    alias: {
      cloudinary: 'https://res.cloudinary.com',
      unsplashPlus: 'https://plus.unsplash.com',
      unsplashImages: 'https://images.unsplash.com'
    }
  }
})
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
    '~/modules/dynamic-config'
  ],

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
    // detectBrowserLanguage: {
    //   useCookie: true,
    //   cookieKey: 'i18n_redirected',
    //   redirectOn: 'root'
    // }
  },

  // Runtime configuration
  runtimeConfig: {
    // Private keys (server-side only)
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
    mongodbName: process.env.MONGODB_NAME || 'nuxt4-cms',
    jwtSecret: process.env.JWT_SECRET || '',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '',
    jwt_expire: process.env.JWT_EXPIRE || '1d',
    jwt_refresh_expire: parseInt(String(process.env.JWT_REFRESH_EXPIRE)) || 2592000000, // 30 Day
    max_devices_pc: 0, // 0 = unlimited
    max_devices_web: 0, // 0 = unlimited
    max_devices_mobile: 0, // 0 = unlimited
    max_devices_tablet: 0, // 0 = unlimited
    route_load_mode: 'static',
    ffmpeg_configuration_sync: true,
    password_reset: 'Bk123456@',
    split_string: '|;*;|',
    // CLOUDINARY
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'ml_default',
    // GOOGLE
    googleClientId: '',     // NUXT_GOOGLE_CLIENT_ID
    googleClientSecret: '', // NUXT_GOOGLE_CLIENT_SECRET
    googleRedirectUri: '',  // NUXT_GOOGLE_REDIRECT_URI

    // Public keys (client-side accessible)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || '/api',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      siteName: 'Nuxt 4 CMS',
      siteDescription: 'A modern content management system built with Nuxt 4'
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

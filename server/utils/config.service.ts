import { SystemConfig } from '../models/SystemConfig'

// Global variable cached in RAM
let configCache: Record<string, any> | null = null

const defaultConfigs = {
  public: {
    site_name: 'Nuxt4 CMS',
    siteIcon: 'i-lucide-layout-dashboard',
    site_description: 'Modern content management system built with Nuxt 4',
    site_url: 'http://localhost:3000',
    maintenance_mode: false,
    public_registration: true,
    copyright: 'tuanmjnh'
  },
  private: {
    smtp_host: 'smtp.example.com',
    smtp_port: 587,
    smtp_user: 'user',
    smtp_pass: 'pass',
    db_seeded: false,
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
    google_redirect_uri: process.env.GOOGLE_REDIRECT_URI || '' // NUXT_GOOGLE_REDIRECT_URI
  }
}

export const configService = {
  // 1. Initialization function (Load from DB to RAM) 
  async load(force = false) {
    if (configCache && !force) return

    try {
      // Initialize with defaults
      const defaults = { ...defaultConfigs.public, ...defaultConfigs.private }

      const configs = await SystemConfig.find()

      // Convert array to object { key: value } for easy access 
      const dbConfigs = configs.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value
        return acc
      }, {} as Record<string, any>)

      // Merge defaults with DB configs (DB takes precedence)
      configCache = { ...defaults, ...dbConfigs }

      console.log('Dynamic Config loaded:', Object.keys(configCache!).length, 'items')
    } catch (e) {
      console.error('Failed to load config:', e)
      // Fallback to defaults if DB fails
      configCache = { ...defaultConfigs.public, ...defaultConfigs.private }
    }
  },

  // 2. Function to get config (Used everywhere) 
  get(key: string, defaultValue: any = null) {
    // Merge defaults for lookup
    const defaults = { ...defaultConfigs.public, ...defaultConfigs.private } as Record<string, any>

    // If there is no cache (first time), return default config or provided defaultValue
    if (!configCache) return defaults[key] ?? defaultValue

    // Return cached value, or default config, or provided defaultValue
    return configCache[key] ?? defaults[key] ?? defaultValue
  },

  // 3. Update function (Used for Admin API)
  async set(key: string, value: any) {
    const type = typeof value === 'boolean' ? 'boolean'
      : typeof value === 'number' ? 'number'
        : typeof value === 'object' ? 'json'
          : 'string'

    // Determine if key is public or private based on defaults (fallback to private/general)
    // Note: This logic assumes if it's in defaultConfigs.public, it's public.
    const isPublic = Object.keys(defaultConfigs.public).includes(key)

    // Save DB
    const updated = await SystemConfig.findOneAndUpdate(
      { key },
      { key, value, type, isPublic },
      { upsert: true, new: true }
    )

    // Update immediately to RAM (No need to reload the entire DB)
    if (configCache) configCache[key] = value

    return updated
  },

  // 4. Reload function (Used when you want to resynchronize the entire)
  async reload() {
    await this.load(true)
  },

  // 5. Get all configs
  getAll() {
    return configCache || {}
  },

  // 6. Get default configs
  getDefaults() {
    return defaultConfigs
  }
}
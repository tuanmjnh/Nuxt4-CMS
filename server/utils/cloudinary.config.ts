import { v2 as _cloudinary } from 'cloudinary'

/**
 * Initialize and return the Cloudinary instance with configuration
 */
export const useCloudinary = () => {
  const config = useRuntimeConfig()

  // Configure Cloudinary with environment variables
  _cloudinary.config({
    cloud_name: config.cloudinary_cloud_name,
    api_key: config.cloudinary_api_key,
    api_secret: config.cloudinary_api_secret,
  })

  return {
    cloudinary: _cloudinary,
    preset: config.cloudinary_upload_preset as string,
    config: {
      cloudName: config.cloudinary_cloud_name,
      apiKey: config.cloudinary_api_key
    }
  }
}

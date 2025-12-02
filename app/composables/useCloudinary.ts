export const useCloudinary = () => {
  const { token } = useAuth()

  /**
   * Get signature for Cloudinary upload
   */
  const getSignature = async (folder?: string): Promise<Cloudinary.IResponseSignature> => {
    return await $fetch('/api/cloudinary/signature', {
      params: { folder },
      headers: {
        Authorization: `Bearer ${token.value}`
      }
    })
  }

  /**
   * Upload file directly to Cloudinary
   */
  const uploadToCloudinary = async (
    file: File,
    folder?: string,
    onProgress?: (progress: number) => void
  ): Promise<Cloudinary.UploadedResponse> => {
    // Get signature
    const signatureData = await getSignature(folder)

    // Prepare form data
    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signatureData.apiKey)
    formData.append('timestamp', String(signatureData.timestamp))
    formData.append('signature', signatureData.signature)
    if (signatureData.preset) {
      formData.append('upload_preset', signatureData.preset)
    }
    if (folder || signatureData.folder) {
      formData.append('folder', folder || signatureData.folder!)
    }

    // Upload to Cloudinary
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100)
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'))
      })

      xhr.open('POST', `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/auto/upload`)
      xhr.send(formData)
    })
  }

  /**
   * Get optimized image URL from Cloudinary
   */
  const getOptimizedUrl = (
    publicId: string,
    options: {
      width?: number
      height?: number
      crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
      quality?: number | 'auto'
      format?: 'auto' | 'jpg' | 'png' | 'webp'
    } = {}
  ): string => {
    const config = useRuntimeConfig()
    const cloudName = config.public.cloudinaryCloudName

    const transformations: string[] = []

    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)
    if (options.crop) transformations.push(`c_${options.crop}`)
    if (options.quality) transformations.push(`q_${options.quality}`)
    if (options.format) transformations.push(`f_${options.format}`)

    const transform = transformations.length > 0 ? `${transformations.join(',')}/` : ''

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transform}${publicId}`
  }

  /**
   * Get video thumbnail URL
   */
  const getVideoThumbnail = (publicId: string, options: { width?: number; height?: number } = {}): string => {
    const config = useRuntimeConfig()
    const cloudName = config.public.cloudinaryCloudName

    const transformations: string[] = ['so_0'] // Start offset at 0 seconds

    if (options.width) transformations.push(`w_${options.width}`)
    if (options.height) transformations.push(`h_${options.height}`)

    const transform = transformations.join(',')

    return `https://res.cloudinary.com/${cloudName}/video/upload/${transform}/${publicId}.jpg`
  }

  return {
    getSignature,
    uploadToCloudinary,
    getOptimizedUrl,
    getVideoThumbnail
  }
}

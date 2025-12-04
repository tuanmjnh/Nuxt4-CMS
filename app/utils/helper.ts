export const removeById = <T extends Record<string, any>>(
  items: T[],
  id: string | number,
  key: keyof T = '_id'
): T[] => {
  const index = items.findIndex((item) => item[key] === id)
  if (index !== -1) {
    items.splice(index, 1)
  }
  return items
}

export const formatDate = (dateString?: string | number | Date | null) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
/** 
* Basic date format 
* @param date - Date object or ISO string 
* @param style - 'date' | 'time' | 'full' 
*/
export const formatDateStyle = (date: string | Date | number | undefined | null, style: 'date' | 'time' | 'full' = 'date'): string => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const { locale } = useI18n()
  // Map locale if needed, or use directly 
  const currentLocale = locale.value === 'vi' ? 'en-VN' : 'en-US'

  const options: Intl.DateTimeFormatOptions = {}

  if (style === 'date') {
    options.day = '2-digit'; options.month = '2-digit'; options.year = 'numeric';
  } else if (style === 'time') {
    options.hour = '2-digit'; options.minute = '2-digit';
  } else if (style === 'full') {
    options.day = '2-digit'; options.month = '2-digit'; options.year = 'numeric';
    options.hour = '2-digit'; options.minute = '2-digit';
  }

  return new Intl.DateTimeFormat(currentLocale, options).format(d)
}

/**
* (Bonus) Format relative time (e.g. 5 minutes ago)
* Note: For perfect accuracy, you need a library like dayjs,
* this is the lightest Native JS version.
*/
export const formatTimeAgo = (date: string | Date | number | undefined | null) => {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const diff = (now.getTime() - d.getTime()) / 1000 // seconds 

  const { locale } = useI18n()
  const currentLocale = locale.value === 'vi' ? 'en-VN' : 'en-US'
  const rtf = new Intl.RelativeTimeFormat(currentLocale, { numeric: 'auto' })

  if (diff < 60) return rtf.format(-Math.floor(diff), 'second')
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), 'minute')
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), 'hour')
  return rtf.format(-Math.floor(diff / 86400), 'day')
}

export const formatNumber = (value: number | string | undefined | null, options?: Intl.NumberFormatOptions): string => {
  if (value === undefined || value === null || value === '') return '0'

  const num = Number(value)
  if (isNaN(num)) return '0'

  // Default Vietnamese (vi-VN), you can change to 'en-US' if you want commas
  return new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 2, // Maximum 2 odd numbers
    ...options
  }).format(num)
}

/**
* Currency format (eg: 100000 -> 100.000 VND)
*/
export const formatCurrency = (value: number | string | undefined | null, currency = 'VND'): string => {
  if (value === undefined || value === null || value === '') return '0 VND'

  const num = Number(value)
  if (isNaN(num)) return '0 ₫'

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0 // VND usually does not use odd numbers 
  }).format(num)
}

/** 
* Shortened format for large numbers (eg: 1,200,000 -> 1.2M or 1.2 million) 
*/
export const formatCompactNumber = (value: number | string | undefined | null) => {
  const num = Number(value || 0)

  return new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(num)
}

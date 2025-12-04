export default defineI18nConfig(() => ({
  // legacy: false,
  // locale: 'vi',
  numberFormats: {
    'en': {
      currency: {
        style: 'currency', currency: 'USD'
      },
      decimal: {
        style: 'decimal', minimumFractionDigits: 2
      }
    },
    'vi': {
      currency: {
        style: 'currency', currency: 'VND'
      },
      decimal: {
        style: 'decimal', minimumFractionDigits: 0
      }
    }
  },
  datetimeFormats: {
    'vi': {
      short: {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }, // Example: December 4, 2025 
      long: {
        year: 'numeric', month: 'long', day: 'numeric',
        weekday: 'long', hour: '2-digit', minute: '2-digit'
      }, // Example: Thursday, December 4, 2025 at 18:30 
      time: {
        hour: '2-digit', minute: '2-digit'
      } // Example: 18:30 
    },
    'en': {
      short: {
        year: 'numeric', month: '2-digit', day: '2-digit'
      }, // Example: April 12, 2025 
      long: {
        year: 'numeric', month: 'long', day: 'numeric',
        weekday: 'long', hour: '2-digit', minute: '2-digit'
      }, // Example: Thursday, December 4, 2025 at 06:30 PM 
      time: {
        hour: '2-digit', minute: '2-digit'
      }
    }
  }
}))
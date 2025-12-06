import { icons as lucideData } from '@iconify-json/lucide'
import { icons as simpleIconsData } from '@iconify-json/simple-icons'

export default defineEventHandler(async (event) => {
  const lucideIcons = Object.keys(lucideData.icons || {}).map(name => `i-lucide-${name}`)
  const simpleIcons = Object.keys(simpleIconsData.icons || {}).map(name => `i-simple-icons-${name}`)

  return {
    lucide: lucideIcons,
    simpleIcons: simpleIcons
  }
})

import defaultSettings from '@/settings'

const title = defaultSettings.title || 'OpenX'

export default function getPageTitle(pageTitle) {
  if (pageTitle) {
    return `${pageTitle} - ${title}`
  }
  return `${title}`
}

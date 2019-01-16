import { browser } from 'webextension-polyfill-ts'
import compareVersions from 'compare-versions'

import { AnalyticsBackgroundPage } from './analytics'
const analytics = new AnalyticsBackgroundPage()

browser.runtime.onInstalled.addListener(details => {
    const reason = details.reason
    const previousVersion = details.previousVersion
    const version = browser.runtime.getManifest().version

    switch (reason) {
    case 'install':
        analytics.logInstall(version)
        break

    case 'update':
        if (previousVersion === version) break
        analytics.logUpdate(previousVersion, version)
        break

    default:
        break
    }

    // Add necessary usage setting in the local storage for v1.1.10 and up
    if (compareVersions(version, '1.1.10') > 0 && compareVersions(previousVersion || '0.0.0', '1.1.10') <= 0) {
        browser.storage.local.set({ 'usage': true })
    }
})

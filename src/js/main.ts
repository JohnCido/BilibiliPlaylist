import { browser } from 'webextension-polyfill-ts'
import compareVersions from 'compare-versions'

import amplitude from 'amplitude-js'
import {
    API_KEY,
    EXT_INSTALL,
    EXT_UPDATE
} from './analytics.types'
let amplitudeInstance = amplitude.getInstance()
amplitudeInstance.init(API_KEY)

browser.runtime.onInstalled.addListener(details => {
    let reason = details.reason
    let previousVersion = details.previousVersion
    let version = browser.runtime.getManifest().version

    switch (reason) {
    case 'install':
        amplitudeInstance.logEvent(EXT_INSTALL, {
            version: version
        })
        break

    case 'update':
        if (previousVersion === version) break
        amplitudeInstance.logEvent(EXT_UPDATE, {
            previousVersion: previousVersion,
            updatedTo: version
        })
        break

    default:
        break
    }

    // Add necessary usage setting in the local storage for v1.1.10 and up
    if (compareVersions(version, '1.1.10') > 0 && compareVersions(previousVersion || '0.0.0', '1.1.10') <= 0) {
        browser.storage.local.set({ 'usage': true })
    }
})

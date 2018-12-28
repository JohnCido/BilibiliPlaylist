import { browser } from 'webextension-polyfill-ts'
import * as compareVersions from 'compare-versions'

import * as Amplitude from 'amplitude-js'
import * as amplitudeTypes from './analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

browser.runtime.onInstalled.addListener(details => {
    let reason = details.reason
    let previousVersion = details.previousVersion
    let version = browser.runtime.getManifest().version

    switch (reason) {
    case 'install':
        amplitudeInstance.logEvent(amplitudeTypes.EXT_INSTALL, {
            version: version
        })
        break

    case 'update':
        if (previousVersion === version) break
        amplitudeInstance.logEvent(amplitudeTypes.EXT_UPDATE, {
            previousVersion: previousVersion,
            updatedTo: version
        })
        break

    default:
        break
    }

    if (compareVersions(version, '1.1.10') > 0 && compareVersions(previousVersion || '0.0.0', '1.1.10') <= 0) {
        browser.storage.local.set({ 'usage': true })
    }
})

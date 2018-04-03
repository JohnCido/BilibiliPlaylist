import compareVersions from 'compare-versions'

import Amplitude from 'amplitude-js'
import * as amplitudeTypes from './analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

chrome.runtime.onInstalled.addListener(details => {
    let reason = details.reason
    let previousVersion = details.previousVersion
    let version = chrome.runtime.getManifest().version

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
        chrome.storage.local.set({ 'usage': true })
    }
})
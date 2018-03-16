import Amplitude from 'amplitude-js'
import * as amplitudeTypes from './analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init('f235621f75e162aa9ccc003c4ad00464')

chrome.runtime.onInstalled.addListener(details => {
    let reason = details.reason
    let version = chrome.runtime.getManifest().version

    switch (reason) {
        case 'install':
        amplitudeInstance.logEvent(amplitudeTypes.EXT_INSTALL, {
            version: version
        })
        break

        case 'update':
        let previousVersion = details.previousVersion
        if (previousVersion === version) break
        amplitudeInstance.logEvent(amplitudeTypes.EXT_UPDATE, {
            previousVersion: previousVersion,
            updatedTo: version
        })
        break

        default:
        break
    }
})
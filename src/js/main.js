import Amplitude from 'amplitude-js'
import * as amplitudeTypes from './analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

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

let analyticsWorker = new SharedWorker('analytics.worker.js')
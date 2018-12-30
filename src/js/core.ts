import {
    browser
} from 'webextension-polyfill-ts'

export class CoreStore {
    private listeners: [] = []
    store: object = {}

    constructor () {
        this.refreshStore()
        browser.storage.onChanged.addListener((_, area) => {
            if (area !== 'local') return
            this.refreshStore()
        })
    }

    refreshStore () {
        browser.storage.local.get(null).then(results => {
            this.store = results
        })
    }
}

import {
    browser
} from 'webextension-polyfill-ts'

export interface IDataStore {
    usage: boolean
    lists: { string?: IListModel }
}

export const defaultDataStore: IDataStore = {
    usage: false,
    lists: { }
}

export interface IListModel {
    id: string
    name: string
    udpatedOn: Date
    owner: string
    uid: string
    personal: boolean
    priv: boolean
    vids: IVideoModel[]
}

export interface IVideoModel {
    av: string
    name: string
    up: string
    length: string
}

export default class CoreStore {
    private listeners: { (store: IDataStore): void }[] = []
    private _store: IDataStore = defaultDataStore

    set store (val) {
        this._store = val
        for (let listener of this.listeners) listener(this.store)
    }

    get store () {
        return this._store
    }

    constructor () {
        this.refreshStore()
        browser.storage.onChanged.addListener((_, area) => {
            if (area !== 'local') return
            this.refreshStore()
        })
    }

    private refreshStore () {
        browser.storage.local.get(null).then(result => {
            this.store = {
                usage: result.usage || false,
                lists: result.lists || []
            }
        }).catch(() => {
            this.store = defaultDataStore
        })
    }

    public onChanged (listener: (store: IDataStore) => void) {
        this.listeners.push(listener)
    }

    public updateList (list: IListModel) {
        browser.storage.local.set({
            lists: {
                [list.id]: list,
                ...this.store.lists
            }
        })
    }
}

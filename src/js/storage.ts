import {
    browser
} from 'webextension-polyfill-ts'

export interface IDataStore {
    usage: boolean
    lists: { [key: string]: IListModel }
}

export const defaultDataStore: IDataStore = {
    usage: false,
    lists: { }
}

export interface IListModel {
    id: string
    name: string
    udpatedOn: number
    owner: string
    uid: string
    personal: boolean
    priv: boolean
    vids: IVideoModel[]
}

export interface IVideoModel {
    av: number
    name: string
    up: string
    length: string
}

export default class CoreStore {
    private listeners: { (store: IDataStore): void }[] = []
    private _store: IDataStore = defaultDataStore

    private _get = browser.storage.local.get
    private _set = browser.storage.local.set
    private _remove = browser.storage.local.remove
    private _clear = browser.storage.local.clear

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

    /**
     * Refresh `_store` property
     */
    private refreshStore () {
        this._get(null).then(result => {
            this.store = {
                usage: result.usage || false,
                lists: result.lists || []
            }
        }).catch(() => {
            this.store = defaultDataStore
        })
    }

    /**
     * Allow external code listens to the storage change
     * @param listener A function to receive changed store
     */
    public onChanged (listener: (store: IDataStore) => void) {
        this.listeners.push(listener)
    }

    /**
     * Save list into the storage.
     * Update existing list.
     * @param list
     */
    public updateList (list: IListModel) {
        this._set({
            lists: {
                ...this.store.lists,
                [list.id]: list
            }
        })
    }

    /**
     * Remove list with matching id from the storage
     * @param id
     */
    public removeList (id: string | number) {
        const lists = { ...this.store.lists }
        delete lists[id]
        this._set({ lists })
    }

    /**
     * Remove all playlists
     */
    public removeAllLists () {
        this._set({
            lists: { }
        })
    }

    /**
     * Set a value by the key in the storage
     * @param key
     * @param value
     */
    public set (key: string | number, value: any) {
        if (key === 'lists') throw new Error('Keyword lists is protected.')
        this._set({
            [key]: value
        })
    }
}

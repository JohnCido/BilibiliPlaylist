import Amplitude from 'amplitude-js'
import CoreStore from './storage'

class Base extends CoreStore {
    private instance: any

    constructor () {
        super()
        this.instance = Amplitude.getInstance()
        this.instance.init('f235621f75e162aa9ccc003c4ad00464')
        console.log(this.instance)
        this.addStoreChangesListener(store => {
            this.instance.setOptOut(!(store.usage || false))
        })
    }

    /**
     * Log an `event` and related `data`
     * @param name
     * @param data
     */
    public log (name: string, data?: any) {
        this.instance.logEvent(name, data)
    }
}

export class AnalyticsBackgroundPage extends Base {
    /**
     * Extension installed
     * @param version
     */
    public logInstall (version: string) {
        this.log('EXT_INSTALL', { version })
    }

    /**
     * Extension just done update
     * @param previousVersion
     * @param updatedTo
     */
    public logUpdate (previousVersion: string | undefined, updatedTo: string) {
        this.log('EXT_UPDATE', { previousVersion, updatedTo })
    }
}

class FrontPage extends Base {
    page!: string

    constructor (page: string) {
        super()
        this.page = page
    }

    /**
     * Log an `event` and related `data` with source `page` identifier attached
     * @param name
     * @param data
     */
    public logWithSource (name: string, data?: any) {
        super.log(name, {
            ...data,
            from: this.page
        })
    }
}

class ListPlayer extends FrontPage {
    /**
     * User started play a list as normal queue
     */
    public logPlayAsQueue () {
        this.logWithSource('PLAY_QUEUE')
    }

    /**
     * User started play a list in shuffle mode
     */
    public logPlayAsShuffle () {
        this.logWithSource('PLAY_SHUFFLE')
    }
}

export class AnalyticsPopupPage extends ListPlayer {
    constructor () {
        super('popup')
    }

    /**
     * User deleted a list
     */
    public logDeleteList () {
        this.logWithSource('PLAYLIST_DELETE')
    }

    /**
     * User deleted all lists
     */
    public logDeleteAllLists () {
        this.logWithSource('PLAYLIST_DELETE_ALL')
    }
}

export class AnalyticsFavoritePage extends ListPlayer {
    constructor () {
        super('favorite')
    }

    /**
     * User just saved a new list
     */
    public logCrawlList () {
        this.log('PLAYLIST_CACHE')
    }

    /**
     * User udpated an existing list
     */
    public logUpdateList () {
        this.log('PLAYLIST_UPDATE')
    }
}

export class AnalyticsVideoPage extends FrontPage {
    constructor () {
        super('video')
    }

    /**
     * About to play the next video in the list
     * @param auto Is it triggered by user
     */
    public logPlayNextVideo (auto = true) {
        this.log('PLAY_NEXT', { auto })
    }

    /**
     * About to play another video in the list
     * @param auto Is it triggered by user
     */
    public logPlayAnotherVideo (auto = false) {
        this.log('PLAY_CHANGE', { auto })
    }
}

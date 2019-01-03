import $ from 'cash-dom'
import {
    currentFavItemSelector,
    favItemIDAttrKey,
    currentFavVidsCountSelector,
    pageIndexItemSelector,
    pageOptionItemSelector,
    optionNameAllCategory,
    optionNameSortRecent,
    videoItemSelector,
    videoItemUnavailabelClassName,
    videoItemAvDataKey,
    videoItemNameSelector,
    videoItemUpNameSelector,
    videoItemUpNameReg,
    videoItemLengthSelector,
    videoItemFetchedDataFlag,
    activePageIndexItemSelector,
    listNameSelector,
    listOwnerSelector,
    favPageURLReg,
    listPersonalIndicatorSelector,
    listPrivateSelector,
    listPrivateText
} from '../strategy/favorite.strategy'
import {
    waterfall,
    whilst
} from 'async'
import {
    IListModel,
    IVideoModel
} from '../storage'

const clickEventName = 'click'
export const crawlList = () => new Promise((resolve: (list?: IListModel) => void, reject) => waterfall([(callback: Function) => {
    // Reset the page index, filter and sort
    $(pageIndexItemSelector).trigger(clickEventName)
    $(pageOptionItemSelector).filter((_: number, item: any) => {
        const name = $(item).text()
        return name === optionNameAllCategory || name === optionNameSortRecent
    }).each((_: number, item: any) => $(item).trigger(clickEventName))
    // Delay the callback a bit to render content
    setTimeout(callback, 400)
}, (callback: (err: Error | null, vids?: IVideoModel[]) => void) => {
    // Total videos count
    const total = parseInt($(currentFavVidsCountSelector).text())
    // Videos array
    const vids: IVideoModel[] = []
    let progress = 0
    whilst(() => progress < total, (cb: any) => {
        // Fetch info of the single video
        $(videoItemSelector).each((_: number, ele: any) => {
            const item = $(ele)
            item.data(videoItemFetchedDataFlag, true)
            progress++
            // Skip video fetch is this video item is dead
            if (item.hasClass(videoItemUnavailabelClassName)) return
            // Add video info
            vids.push({
                av: item.data(videoItemAvDataKey),
                name: item.find(videoItemNameSelector).text(),
                up: (videoItemUpNameReg.exec(item.find(videoItemUpNameSelector).text()) || [])[1],
                length: item.find(videoItemLengthSelector).text()
            })
        })
        // Go to next page
        $(activePageIndexItemSelector).next().trigger(clickEventName)
        // Wait until first video element has changed
        if (progress !== total) {
            cb()
            return
        }
        whilst(
            () => !$(videoItemSelector).data(videoItemFetchedDataFlag),
            () => { },
            cb
        )
    }, (err) => {
        if (err) {
            callback(err)
            return
        }
        callback(null, vids)
    })
}, (vids: IVideoModel[], callback: (err: Error | null, list?: IListModel) => void) => {
    // List ID
    const id: string = $(currentFavItemSelector).attr(favItemIDAttrKey)
    // Get list info
    callback(null, {
        id,
        name: $(listNameSelector).text(),
        udpatedOn: Date.now(),
        owner: $(listOwnerSelector).text(),
        uid: (favPageURLReg.exec(document.URL) || [])[1],
        personal: $(listPersonalIndicatorSelector).css('display') !== 'none',
        priv: $(listPrivateSelector).text() === listPrivateText,
        vids
    })
}], (err, list?: IListModel) => {
    // Back to page one
    setTimeout(() => $(pageIndexItemSelector).filter((_: number, item: any) => {
        return $(item).text() === '1'
    }).trigger(clickEventName), 300)
    if (err) {
        reject(err)
        return
    }
    resolve(list)
}))

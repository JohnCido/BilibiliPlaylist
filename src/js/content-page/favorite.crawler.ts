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
import { intervalTest } from '../utils'

const clickEventName = 'click'
export const crawlList = () => new Promise((resolve: (list?: IListModel) => void, reject) => waterfall([(callback: any) => {
    // Reset the filter and sort
    $(pageOptionItemSelector).filter((_: number, item: any) => {
        const name = $(item).text()
        return name === optionNameAllCategory || name === optionNameSortRecent
    }).each((_: number, item: any) => $(item).trigger(clickEventName))
    // Go back to page one if necessary
    setTimeout(() => {
        if ($(pageIndexItemSelector).text() === '1') callback()
        else backToPageOne().then(callback).catch(callback)
    }, 400)
}, (callback: (err: Error | null, vids?: IVideoModel[]) => void) => {
    // Total videos count
    const total = parseInt($(currentFavVidsCountSelector).text())
    // Videos array
    const vids: IVideoModel[] = []
    let progress = 0
    whilst(() => progress < total, (cb: any) => {
        // Fetch info of the single video
        const items: HTMLElement[] = Array.from($(videoItemSelector))
        for (let ele of items) {
            const item = $(ele)
            progress++

            // Skip video fetch if this video item is dead
            if (item.hasClass(videoItemUnavailabelClassName)) continue
            // Skip this video if it has flag
            if (ele.dataset[videoItemFetchedDataFlag] === videoItemFetchedDataFlag) continue

            // Set the crawler flag
            ele.dataset[videoItemFetchedDataFlag] = videoItemFetchedDataFlag

            // Add video info
            vids.push({
                av: item.data(videoItemAvDataKey),
                name: item.find(videoItemNameSelector).text(),
                up: (videoItemUpNameReg.exec(item.find(videoItemUpNameSelector).text()) || [])[1],
                length: item.find(videoItemLengthSelector).text()
            })
        }
        // Stop the process if all videos are already crawled
        if (progress === total) {
            cb()
            return
        }
        // Go to next page
        jumpToPage($(activePageIndexItemSelector).next()).then(cb).catch(cb)
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
    backToPageOne()
    if (err) {
        reject(err)
        return
    }
    resolve(list)
}))

/**
 * Jump to a page index by performing click on given element
 * @param ele A `HTMLElement` or `Cash` instance
 */
function jumpToPage (ele: HTMLElement) {
    const item = ele instanceof $ ? ele : $(ele)
    item.trigger(clickEventName)
    return intervalTest(() => {
        return ($(videoItemSelector)[0].dataset[videoItemFetchedDataFlag] !== videoItemFetchedDataFlag)
    })
}

/**
 * Shortcut of going back to page one
 */
function backToPageOne () {
    return jumpToPage($(pageIndexItemSelector).filter((_: number, item: any) => {
        return $(item).text() === '1'
    }))
}

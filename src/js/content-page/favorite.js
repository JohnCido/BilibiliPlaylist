require('../../css/favorite.less')
import util from '../util'
import dom from '../domNode'

import whilst from 'async/whilst'
import randomString from 'randomstring'

//Sentry
import Raven from 'raven-js'

//Amplitude
import Amplitude from 'amplitude-js'
import * as amplitudeTypes from '../analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

//If extension is initialized on this page
var initialized = false
const pageUrlReg = /^(?:http|https):\/\/space\.bilibili\.com\/(\d+)\/.*favlist(?:|\?fid=(\d+))$/
const videoUrlReg = /^(?:http|https):\/\/www\.bilibili\.com\/video\/av(\d+)$/

//Buttons
var buttonSave

//Favlist objects
var allList
var favTitle
var favCount
var listPager

function $(id) {
    return document.getElementById(id)
}

function $c(c) {
    return document.getElementsByClassName(c)
}

//Respond to page url change
// window.addEventListener('hashchange', () => {
//     setTimeout(function() {
//         validate()
//     }, 200);
// })
window.onload = () => {
    Raven.config('https://07112646a4334707b6a9a2477c43a195@sentry.io/263709', {
        whitelistUrls: [pageUrlReg]
    }).install()
    setTimeout(() => {
        Raven.context(() => {
            validate()
        })
    }, 1500)
    for (let btn of Array.from($c('n-btn'))) {
        btn.addEventListener('click', () => {
            console.log('click n btn')
            setTimeout(function() {
                Raven.context(() => {
                    validate()
                })
            }, 200);
        })
    }
}

function favListId() {
    return pageUrlReg.exec(document.URL)[2]
}

//Validate page url, check if it's a favlist page
function validate() {
    let url = document.URL
    if (pageUrlReg.test(url)) {
        //console.log(`url ${url} got a match`)
        init()
    }
}

//And play as list button and related CSS
function init() {
    allList = $('fav-list-container')
    favTitle = $c('item cur')[0]
    favCount = $c('fav-meta')[0].getElementsByClassName('num')[0]
    listPager = $c('sp-pager')[0]

    //Overlay
    if (!$('bp-overlay')) {
        overlay = util.append(document.body, util.create({
            type: 'div',
            id: 'bp-overlay'
        }), true, true)
        progress = util.append(overlay, util.create({
            type: 'div',
            id: 'bp-progress'
        }), true, true)
    }

    //List container
    if (!$('bp-list-container')) {
        let listContainer = util.append($c('fav-main')[0], util.create({
            type: 'div',
            id: 'bp-list-container'
        }), false, true)
        util.append(listContainer, util.create({
            type: 'i',
            class: 'material-icons bp-button',
            inner: 'play_arrow',
            prop: [['title', '按列表播放这个收藏夹']],
            event: [[ 'onclick', () => { Raven.context(() => { play() }) } ]]
        }))
        util.append(listContainer, util.create({
            type: 'i',
            class: 'material-icons bp-button',
            inner: 'shuffle',
            prop: [['title', '随机播放这个收藏夹']],
            event: [[ 'onclick', () => { Raven.context(() => { shuffle() }) } ]]
        }))
        buttonSave = util.append(listContainer, util.create({
            type: 'i',
            class: 'material-icons bp-button',
            inner: 'file_download',
            prop: [['title', '刷新这个收藏夹的本地缓存']],
            event: [['onclick', () => { Raven.context(() => { save() }) } ]]
        }), false, true)
    }

    //All lists
    // if (!$('bp-save-all')) {
    //     let navTitle = $c('nav-container fav-container')[0].getElementsByClassName('nav-title')[0]
    //     util.append(navTitle, util.create({
    //         type: 'span',
    //         id: 'bp-save-all',
    //         class: 'icon-add material-icons bp-button',
    //         inner: 'cloud_download',
    //         prop: [
    //             ['title', '缓存所有收藏夹列表'],
    //             ['style', 'right:34px']
    //         ],
    //         event: [['onclick', saveAll]]
    //     }))
    // }

    if (initialized) { return }
    util.AddSheetFile(`${chrome.extension.getURL('css/')}favorite.css`)
    initialized = true
}

//Play as list
function play() {
    // var list = db.getList(favListId())
    // if (list !== undefined) {
    //     window.open(`https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${list.id}`)
    // } else {
    //     save(() => {
    //         list = db.getList(favListId())
    //         window.open(`https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${list.id}`)
    //     }, true)
    // }
    open(favListId(), false, success => {
        if (success) { return }
        save(() => {
            open(favListId(), false)
        }, true)
    })
    amplitudeInstance.logEvent(amplitudeTypes.PLAY_QUEUE, {
        from: 'favorite'
    })
}

function shuffle() {
    open(favListId(), true, success => {
        if (success) { return }
        save(() => {
            open(favListId(), true)
        }, true)
    })
    amplitudeInstance.logEvent(amplitudeTypes.PLAY_SHUFFLE, {
        from: 'favorite'
    })
}

function open(id, shuffle, callback) {
    chrome.storage.local.get(id, (obj) => {
        var list = obj[id]
        if (list === undefined || list === null) {
            //alert('请求的列表不存在')
            callback(false)
            return
        }
        var url
        if (shuffle) {
            let seed = randomString.generate(5)
            util.shuffle(list.vids, seed)
            url = `https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${id}&seed=${seed}`
        } else {
            url = `https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${id}&seed=0`
        }
        window.open(url)

        if (callback) callback(true)
    })
}

//Save current list
import videoMiner from '../model/video.miner'
import listModel from '../model/list.model'

function save(callback, override = false) {
    let isChained = callback && typeof(callback) === 'function'

    const delay = 300
    const total = parseInt($c('fav-item cur')[0].getElementsByClassName('num')[0].innerHTML)
    //console.log(total)
    var avList = []
    var count = total
    const isLongList = count > 60
    if (isLongList) { showOverlay() }

    if (count === 0) {
        //Empty favlist
        chrome.storage.local.remove(favListId(), () => {})
        return
    }

    let list = listModel(
        //id
        favListId(),
        //name
        favTitle.innerHTML,
        //owner
        $('h-name').innerHTML,
        //uid
        pageUrlReg.exec(document.URL)[1],
        //isPersonal
        $c('space-theme-trigger icon')[0].style.display !== 'none',
        //isPrivate
        $c('fav-meta')[0].getElementsByClassName('type')[0].innerHTML === '私有'
    )
    //Reset page
    util.fireEvent('click', $c('be-pager-item')[0])
    util.fireEvent(
        'click',
        Array.from($c('be-dropdown-item')).find(item => dom.firstChild(item).innerHTML === '全部分区')
    )
    util.fireEvent(
        'click',
        Array.from($c('be-dropdown-item')).find(item => item.innerHTML === '最近收藏')
    )

    setTimeout(() => {
        whilst(
            () => count > 0,
            (cb) => {
                let array = Array.from($c('small-item'))
                for (let item of array) {
                    //Get video info
                    let vid = videoMiner(item)
                    if (vid === undefined) {
                        count--
                        continue
                    }
                    let av = vid.av
                    if (avList.indexOf(av) !== -1) continue
                    avList.push(av)
                    list.vids.push(vid)
                    //Count down
                    count--
                    if (!isChained || override) { updateProgress(1 - count / total) }
                }
                if (count > 0) {
                    //Move to next page
                    util.fireEvent('click', dom.nodeAfter($c('be-pager-item be-pager-item-active')[0]))
                    util.intervalTest(
                        () => !$c('small-item')[0].classList.contains('bp-fetched'),
                        () => {
                            cb(null, count)
                        },
                        10
                    )
                } else {
                    //Finish fetching
                    cb(null, count)
                }
            },
            (err, n) => {
                if (err) {
                    alert(err)
                    return
                }
                //Back to page one
                util.fireEvent('click', $c('be-pager-item')[0])

                //console.log(avList)
                //console.log(list)
                chrome.storage.local.get(list.id, o => {
                    let l = o[list.id]
                    if (l === undefined || l === null) {
                        amplitudeInstance.logEvent(amplitudeTypes.PLAYLIST_CACHE)
                    } else {
                        amplitudeInstance.logEvent(amplitudeTypes.PLAYLIST_UPDATE)
                    }
                    chrome.storage.local.set({ [list.id]: list }, () => { })
                })
                //db.saveList(list)
                //Finish fetch this favlist
                if (!isChained || override) { hideOverlay() }

                if (isChained) {
                    callback()
                }
                if (!isLongList && !isChained && !override) {
                    buttonSave.classList.add('done')
                    setTimeout(function() {
                        buttonSave.classList.remove('done')
                    }, 1200);
                }
            }
        )
    }, delay)
}

//Save all favlist
function saveAll() {
    //Overlay
    showOverlay()

    const delay = 600
    let list = $c('fav-list')[0]
    const total = list.children.length
    var count = total
    window.location = hrefOf(dom.firstChild(list))
    setTimeout(() => {
        whilst(
            () => count > 0,
            (cb) => {
                save(() => {
                    count--
                    updateProgress(1 - count / total)

                    if (count > 0) {
                        //Move to next folder
                        window.location = hrefOf(dom.nodeAfter($c('fav-item cur')[0]))
                        setTimeout(() => {
                            cb(null, count)
                        }, delay)
                    } else {
                        //Finish favList
                        cb(null, count)
                    }
                })
            },
            (err, n) => {
                if (err) {
                    alert(err)
                    return
                }
                //Fetch default folder
                window.location = hrefOf($c('fav-item default-fav')[0])
                setTimeout(() => {
                    save(() => {
                        //All done
                        hideOverlay()
                    })
                }, delay)
            }
        )
    }, delay)

    function hrefOf(item) {
        return item.getElementsByClassName('text router-link-active')[0].href
    }
}

//Overlay and progress functions
var overlay
var progress

function showOverlay() {
    document.body.style.overflow = 'hidden'
    overlay.style.display = 'block'
    overlay.style.opacity = 1
}

function hideOverlay() {
    overlay.style.opacity = 0
    setTimeout(function() {
        overlay.style.display = 'none'
        updateProgress(0)
        document.body.style.overflow = 'auto'
    }, 250);
}

function updateProgress(p) {
    progress.style.width = `${p * 100}%`
}
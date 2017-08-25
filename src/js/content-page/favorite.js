require('../../css/favorite.less')
import util from '../util'
import dom from '../domNode'

import whilst from 'async/whilst';

//If extension is initialized on this page
var initialized = false
const pageUrlReg = /^(?:http|https):\/\/space\.bilibili\.com\/(\d+)\/.*favlist\?fid=(\d+)$/
const videoUrlReg = /^(?:http|https):\/\/www\.bilibili\.com\/video\/av(\d+)$/

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
window.addEventListener('hashchange', () => {
    setTimeout(function() {
        validate()
    }, 200);
})
window.onload = function () {
    setTimeout(() => {
        validate()
    }, 1500)
}

function favListId() {
    return $c('fav-item cur')[0].getAttribute('fid')
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
            prop: [['title', '缓存并按照按列表播放当前收藏夹']],
            event: [['onclick', play]]
        }))
    }

    //All lists
    if (!$('bp-save-all')) {
        let navTitle = $c('nav-container fav-container')[0].getElementsByClassName('nav-title')[0]
        util.append(navTitle, util.create({
            type: 'span',
            id: 'bp-save-all',
            class: 'icon-add material-icons bp-button',
            inner: 'cloud_download',
            prop: [
                ['title', '缓存所有收藏夹为本地列表'],
                ['style', 'right:34px']
            ],
            event: [['onclick', saveAll]]
        }))
    }

    if (initialized) { return }
    util.AddSheetFile(`${chrome.extension.getURL('css/')}favorite.css`)
    initialized = true
}

import openList from '../openList'
//Play as list
function play() {
    save(() => {
        const id = favListId()
        chrome.storage.local.get(id, (obj) => {
            let list = obj[id]
            if (list === undefined || list === null) { return }
    
            let url = `https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${id}`
            window.open(url)
        })
    }, true)
}

//Save current list
import videoModel from '../model/video.model'
import listModel from '../model/list.model'

function save(callback, override = false) {
    let isChained = callback && typeof(callback) === 'function'

    const delay = 300
    const total = parseInt(favCount.innerHTML)
    var count = total
    if (count > 60) { showOverlay() }

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
        dom.firstChild($c('uname')[0]).innerHTML === $('h-name').innerHTML,
        //isPrivate
        $c('fav-meta')[0].getElementsByClassName('type')[0].innerHTML === '私有'
    )
    //Reset page
    util.fireEvent('click', $c('sp-pager-item')[0])
    util.fireEvent(
        'click',
        Array.from($c('sort-item')).find(item => dom.firstChild(item).innerHTML === '全部分区')
    )
    util.fireEvent(
        'click',
        Array.from($c('action-item')).find(item => item.innerHTML === ' 最近收藏 ')
    )

    setTimeout(() => {
        whilst(
            () => count > 0,
            (cb) => {
                let array = Array.from($c('small-item'))
                for (let item of array) {
                    //Get video info
                    let cover = item.getElementsByClassName('cover')[0]
                    let info = cover.getElementsByClassName('meta-mask')[0].getElementsByClassName('meta-info')[0]
                    let title = item.getElementsByClassName('title')[0]
                    if (videoUrlReg.test(title.href)) {
                        let vid = videoModel(
                            //av
                            videoUrlReg.exec(title.href)[1],
                            //name
                            title.innerHTML,
                            //up
                            /^UP主：(.*)$/.exec(info.getElementsByClassName('author')[0].innerHTML)[1],
                            //length
                            cover.getElementsByClassName('length')[0].innerHTML
                        )
                        list.vids.push(vid)
                    }
                    //Count down
                    count--
                    if (!isChained || override) { updateProgress(1 - count / total) }
                }
                if (count > 0) {
                    //Move to next page
                    util.fireEvent('click', dom.nodeAfter($c('sp-pager-item sp-pager-item-active')[0]))
                    setTimeout(() => {
                        cb(null, count)
                    }, delay)
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
                util.fireEvent('click', $c('sp-pager-item')[0])

                //console.log(list)
                chrome.storage.local.set({ [list.id]: list }, () => { })
                //db.saveList(list)
                //Finish fetch this favlist
                if (!isChained || override) { hideOverlay() }

                if (isChained) {
                    callback()
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
                        }, delay);
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
        return item.getElementsByClassName('text v-link-active')[0].href
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
require('../../css/favorite.less')
import util from '../util'
import dom from '../domNode'
import whilst from 'async/whilst';

//If extension is initialized on this page
var initialized = false
const pageUrlReg = /^(?:http|https):\/\/space\.bilibili\.com\/\d+\/#!\/favlist\?fid=(\d+)$/

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
    return pageUrlReg.exec(document.URL)[1]
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
    let title = $c('fav-header fav-header-info')[0].getElementsByClassName('breadcrumb')[0]
    favTitle = $c('item cur')[0]
    favCount = $c('fav-meta')[0].getElementsByClassName('num')[0]
    listPager = $c('sp-pager')[0]

    //List container
    if (!$('bp-list-container')) {
        let listContainer = util.append(title, util.create({
            type: 'div',
            id: 'bp-list-container'
        }), false, true)
        util.append(listContainer, util.create({
            type: 'i',
            class: 'material-icons bp-button',
            inner: 'playlist_play',
            prop: [['title', '按列表播放这个收藏夹']],
            event: [['onclick', play]]
        }))
        util.append(listContainer, util.create({
            type: 'i',
            class: 'material-icons bp-button',
            inner: 'autorenew',
            prop: [['title', '刷新这个收藏夹的本地缓存']],
            event: [['onclick', update]]
        }))
    }

    //All lists
    if (!$('bp-save-all')) {
        let navTitle = $c('nav-container fav-container')[0].getElementsByClassName('nav-title')[0]
        util.append(navTitle, util.create({
            type: 'span',
            id: 'bp-save-all',
            class: 'icon-add material-icons bp-button',
            inner: 'file_download',
            prop: [
                ['title', '缓存所有收藏夹列表'],
                ['style', 'right:34px']
            ],
            event: [['onclick', saveAll]]
        }))
    }

    if (initialized) return
    util.AddSheetFile(`${chrome.extension.getURL('css/')}favorite.css`)
    initialized = true
}

//Play as list
function play() {
    console.log('begin play')
}

import videoModel from '../model/video.model'
import listModel from '../model/list.model'
//Update cache of current list
function update(callback) {
    var count = parseInt(favCount.innerHTML)
    if (count === 0) {
        //Empty favlist
        return
    }

    let list = listModel(favListId(), favTitle.innerHTML, true, true)
    //Reset to page one
    util.fireEvent('click', $c('sp-pager-item')[0])
    const delay = 200
    setTimeout(function() {
        whilst(
            () => count > 0,
            (cb) => {
                let array = Array.from($c('small-item'))
                for (let item of array) {
                    //Get video info
                    let cover = item.getElementsByClassName('cover')[0]
                    let disabledCover = cover.getElementsByClassName('disabled-cover')[0]
                    if (util.styleValue('display', disabledCover) === 'none') {
                        let title = item.getElementsByClassName('title')[0]
                        let vid = videoModel(
                            /^(?:http|https):\/\/www\.bilibili\.com\/video\/av(\d+)$/.exec(title.href)[1],
                            title.innerHTML,
                            /^UP主：(.*)$/.exec(cover.getElementsByClassName('meta-mask')[0].getElementsByClassName('meta-info')[0].getElementsByClassName('author')[0].innerHTML)[1]
                        )
                        list.vids.push(vid)
                    }
                    count--
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
            function (err, n) {
                //Back to page one
                util.fireEvent('click', $c('sp-pager-item')[0])
                if (err) {
                    alert(err)
                    return
                }
                console.log(list)
                chrome.storage.local.set({ [list.id]: list }, () => {

                })
                //Finish fetch this favlist
                if (callback && typeof(callback) === 'function') callback()
            }
        )
    }, delay)
}

//Save all favlist
function saveAll() {

}
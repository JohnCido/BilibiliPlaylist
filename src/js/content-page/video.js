require('../../css/video.less')
import util from '../util'
import dom from '../domNode'

//Sentry
import Raven from 'raven-js'
//Amplitude
import Amplitude from 'amplitude-js'
import * as amplitudeTypes from '../analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

var initialized = false
var loaded = false
const pageUrlReg = /^(?:http|https):\/\/www\.bilibili\.com\/video\/av(\d+)\/\?bpid=(\d+)&seed=(.+)$/

var list
var seed
var listContainer
var infoBar

var nextVideoIndex

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
//     }, 250);
// })
window.onload = function () {
    Raven.config('https://07112646a4334707b6a9a2477c43a195@sentry.io/263709').install();
    Raven.context(() => {
        validate()
    })
}

//Validate page url, check if it's a video page with bpid parameter
function validate() {
    let url = document.URL
    if (pageUrlReg.test(url)) {
        let id = pageUrlReg.exec(document.URL)[2]
        seed = pageUrlReg.exec(document.URL)[3]
        chrome.storage.local.get(id, (obj) => {
            if (Object.keys(obj).length === 0) { return }
            list = obj[id]
            util.shuffle(list.vids, seed)
            init()
        })
    }
}

function init() {
    if (initialized) { return }
    //Add CSS
    util.AddSheetFile(`${chrome.extension.getURL('/')}video.css`)
    
    //Start playing video
    util.intervalTest(() => {
        let v = dom.firstChild($c('bilibili-player-video')[0])
        return v !== null && v !== undefined
    }, () => {
        let video = dom.firstChild($c('bilibili-player-video')[0])
        video.addEventListener('ended', next)
        video.play()
    })

    //Scroll the page to show the player
    window.scrollTo(0, 230)
    
    //Open recommend panel and change button text
    let listButton = $c('bilibili-player-filter-btn')[0]
    listButton.getElementsByClassName('bpui-button-text')[0].innerHTML = '播放列表'
    util.fireEvent('click', listButton)
    //Load list into panel
    listContainer = $c('bilibili-player-recommend')[0]
    util.intervalTest(() => {
        return listContainer.innerHTML !== ''
    }, () => {
        loadList()
    }, 50)
    setTimeout(() => {
        if (listContainer.innerHTML === '') {
            loadList()
        }
    }, 500)
    initialized = true
}

function loadList() {
    if (loaded) { return }

    listContainer.classList.add('bp-list-container')
    listContainer.style.display = 'block'
    listContainer.innerHTML = ''
    let id = pageUrlReg.exec(document.URL)[2]
    //Remove current breadcrumbs
    infoBar = $c('tminfo')[0]
    while (dom.firstChild(infoBar).tagName !== 'TIME') {
        let b = dom.firstChild(infoBar)
        b.parentNode.removeChild(b)
    }
    //Load breadcrumbs
    util.append(
        infoBar,
        [
            //space
            // util.create({
            //     type: undefined,
            //     inner: '    '
            // }),
            //Link to fav folder
            util.append(util.create({
                type: 'span',
                prop: [['typeof', 'v:Breadcrumb']]
            }), util.create({
                type: 'a',
                inner: list.name,
                prop: [
                    ['rel', 'v:url'],
                    ['property', 'v:title'],
                    ['href', `https://space.bilibili.com/${list.uid}/#!/favlist?fid=${list.id}`],
                    ['target', '_blank']
                ]
            })),
            //Separator
            util.create({
                type: undefined,
                inner: ' > '
            }),
            //Link to owner profile
            util.create({
                type: 'a',
                inner: list.owner,
                prop: [
                    ['rel', 'v:url'],
                    ['property', 'v:title'],
                    ['href', `https://space.bilibili.com/${list.uid}/#!/index`],
                    ['target', '_blank']
                ]
            })
        ],
        true
    )

    //Load video list
    var index = 0
    var lock = false
    for (let [i, vid] of list.vids.entries()) {
        let isActive = pageUrlReg.exec(document.URL)[1] === vid.av
        if (!isActive && !lock) { index++ }
        else { lock = true }
        let a = util.create({
            type: 'a',
            class: `bp-list-item${isActive ? ' active' : ''}`,
            data: [['index', i + 1]],
            event: [
                ['onclick', e => {
                    amplitudeInstance.logEvent(amplitudeTypes.PLAY_CHANGE, {
                        auto: false
                    })
                    window.location = `https://www.bilibili.com/video/av${vid.av}/?bpid=${list.id}&seed=${seed}`
                }]
            ]
        })
        util.append(a, util.create({
            type: 'span',
            inner: vid.name,
            prop: [['name', '']]
        }))
        util.append(a, util.create({
            type: 'span',
            inner: vid.length,
            prop: [['length', '']]
        }))
        util.append(listContainer, a, false)
    }

    nextVideoIndex = index === list.vids.length - 1 ? 0 : index + 1
    let containerHeight = parseInt(/^(\d+)px$/.exec(util.styleValue('height', listContainer.parentNode)))
    //Update scroll position inside list
    let contentH = list.vids.length * 32
    let ratio = index / list.vids.length
    let top = contentH * ratio + ratio * 2.75 * 32
    setTimeout(() => {
        listContainer.scrollTop = Math.round(top)
    }, 500)

    loaded = true
}

function next(auto=true) {
    amplitudeInstance.logEvent(amplitudeTypes.PLAY_NEXT, {
        auto: auto
    })
    var av = list.vids[nextVideoIndex].av
    window.location = `https://www.bilibili.com/video/av${av}/?bpid=${list.id}&seed=${seed}`
}
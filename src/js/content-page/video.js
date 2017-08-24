require('../../css/video.less')
import util from '../util'
import dom from '../domNode'

var initialized = false
const pageUrlReg = /^(?:http|https):\/\/www\.bilibili\.com\/video\/av(\d+)\/\?bpid=(\d+)$/

var listContainer

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
    }, 250);
})
window.onload = function () {
    setTimeout(() => {
        validate()
    }, 1500)
}

//Validate page url, check if it's a favlist page
function validate() {
    let url = document.URL
    if (pageUrlReg.test(url)) {
        //console.log(`url ${url} got a match`)
        init()
    }
}

function init() {
    if (initialized) { return }
    util.AddSheetFile(`${chrome.extension.getURL('css/')}video.css`)
    initialized = true

    let listButton = $c('bilibili-player-filter-btn')[0]
    listButton.getElementsByClassName('bpui-button-text')[0].innerHTML = '播放列表'
    util.fireEvent('click', listButton)
    
    setTimeout(() => {
        listContainer = dom.firstChild(dom.firstChild(dom.firstChild($c('bilibili-player-recommend')[0])))
        loadList()

        let video = dom.firstChild($c('bilibili-player-video')[0])
        video.addEventListener('ended', next)
        video.play()
    }, 300)
}

function loadList() {
    listContainer.innerHTML = ''
    let id = pageUrlReg.exec(document.URL)[2]
    chrome.storage.local.get(id, (obj) => {
        let list = obj[id]
        if (!list) { return }

        var index = 0
        var lock = false
        for (let vid of list.vids) {
            let isActive = pageUrlReg.exec(document.URL)[1] === vid.av
            if (!isActive && !lock) { index++ }
            else { lock = true }
            let a = util.create({
                type: 'a',
                class: `bp-list-item${isActive ? ' active' : ''}`,
                prop: [
                    ['href', `https://www.bilibili.com/video/av${vid.av}/?bpid=${pageUrlReg.exec(document.URL)[2]}`]
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

        let containerHeight = parseInt(/^(\d+)px$/.exec(util.styleValue('height', listContainer.parentNode)))
        console.log(util.styleValue('height', listContainer.parentNode))
        listContainer.style.top = `-${(index - 2.5) * 32 + (index / list.vids.length) * containerHeight * 0.5}px`
    })
}

function next() {
    let n = dom.nodeAfter($c('bp-list-item active')[0])
    if (n) {
        window.location = n.href
    } else {
        window.location = $c('bp-list-item')[0].href
    }
}
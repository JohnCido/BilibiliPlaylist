require('../css/popup.less')
import util from './util'
import dom from './domNode'

var list

window.onload = () => {
    list = document.getElementById('list')
    load()
    
    document.getElementById('clear').onclick = () => {
        chrome.storage.local.clear(() => { })
        load()
    }
}

function del(e) {
    let target = e.target
    let id = target.getAttribute('fid')

    chrome.storage.local.remove(id, () => {
        let item = target.parentNode
        item.parentNode.removeChild(item)

        if (list.innerHTML === '') {
            load()
        }
    })
}

function load() {
    list.innerHTML = ''

    chrome.storage.local.get(null, local => {
        let keys = Object.keys(local)
        if (keys.length === 0) {
            list.classList.add('empty')
            return
        }

        for (let key of keys) {
            let favlist = local[key]

            let item = util.create({
                type: 'li',
                class: 'item'
            })
            util.append(item, [
                util.create({
                    type: 'a',
                    class: 'name',
                    inner: favlist.name,
                    prop: [
                        ['href', `https://www.bilibili.com/video/av${favlist.vids[0].av}/?bpid=${favlist.id}`],
                        ['target', '_blank']
                    ]
                }),
                util.create({
                    type: 'button',
                    class: 'delete material-icons',
                    inner: 'delete',
                    prop: [['fid', `${favlist.id}`]],
                    event: [['onclick', del]]
                })
            ])
            util.append(list, item)
        }
    })
}
require('../../css/favorite.less')

window.addEventListener('hashchange', validate)
window.onload = function () {
    validate()
}

function $(id) {
    return document.getElementById(id)
}

function $c(c) {
    return document.getElementsByClassName(c)
}

//param: type id class prop data css inner event
function create(param) {
    //print(param);
    var t;
    if (param.type !== 'svg' && param.type !== 'path' && param.type !== 'circle')
        t = document.createElement(param.type);
    else
        t = document.createElementNS('http://www.w3.org/2000/svg', param.type);
    if (param.class) t.className = param.class;
    if (param.id) t.id = param.id;
    if (param.css) {
        param.css.forEach(function (c) {
            t.style[c[0]] = c[1];
        })
    }
    if (param.data) {
        param.data.forEach(function (d) {
            t.dataset[d[0]] = d[1];
        })
    }
    if (param.prop) {
        param.prop.forEach(function (p) {
            t.setAttribute(p[0], p[1]);
        })
    }
    if (param.inner) {
        t.innerHTML = param.inner;
    }
    if (param.event) {
        param.event.forEach(function (e) {
            t[e[0]] = e[1];
        })
    }
    return t;
}

//target: append to this target; list: child node(s); first: set true if append at first
//child: true if return appended child node
function append(target, list, first = false, child = false) {
    var node;
    if (Array.isArray(list)) {
        list.forEach(function (item, index) {
            if (first)
                node = target.insertBefore(item, target.firstChild);
            else
                node = target.appendChild(item);
        })
    } else {
        if (first)
            node = target.insertBefore(list, target.firstChild);
        else
            node = target.appendChild(list);
    }
    if (child)
        return node;
    else
        return target;
}

//append css sheet
function AddSheetFile(path){
    document.head.appendChild(create({
        type: 'link',
        prop: [
            ['rel', 'stylesheet'],
            ['type', 'text/css'],
            ['href', path]
        ]
    }));
}

function validate() {
    let url = document.URL
    if (/^(?:http|https):\/\/space\.bilibili\.com\/\d+\/#!\/favlist\?fid=\d+.$/.test(url)) {
        console.log(`url ${url} got a match`)
        init()
    }
}

function init() {
    let title = $c('fav-header fav-header-info')[0].getElementsByClassName('breadcrumb')[0]
    if ($('bp-play')) { return }

    AddSheetFile(`${chrome.extension.getURL('css/')}favorite.css`)
    append(title, create({
        type: 'span',
        id: 'bp-play',
        inner: '列表播放',
        event: [['onclick', play]]
    }))
}

function play() {
    console.log('begin play')
}
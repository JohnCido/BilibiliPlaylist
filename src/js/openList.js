export default function (id, callback) {
    var id = `${id}`
    chrome.storage.local.get(id, (obj) => {
        let list = obj[id]
        if (list === undefined || list === null) {
            //alert('请求的列表不存在')
            callback(false)
            return
        }

        let url = `https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${id}`
        window.open(url)
        callback(true)
    })
}
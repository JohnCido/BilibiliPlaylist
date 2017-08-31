import videoModel from '../model/video.model'
const videoUrlReg = /^(?:http|https):\/\/www\.bilibili\.com\/video\/av(\d+)$/

export default function(item) {
    item.classList.add('bp-fetched')

    let cover = item.getElementsByClassName('cover')[0]
    let info = cover.getElementsByClassName('meta-mask')[0].getElementsByClassName('meta-info')[0]
    let title = item.getElementsByClassName('title')[0]
    if (videoUrlReg.test(title.href)) {
        let vid = videoModel(
            //av
            item.dataset.aid,
            //name
            title.innerHTML,
            //up
            /^UP主：(.*)$/.exec(info.getElementsByClassName('author')[0].innerHTML)[1],
            //length
            cover.getElementsByClassName('length')[0].innerHTML
        )
        return vid
    } else {
        return undefined
    }
}
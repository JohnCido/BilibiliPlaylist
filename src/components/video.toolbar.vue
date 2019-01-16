<template lang="pug">
.bl-video-toolbar(v-show='valid' :class='expanded ? "expanded" : ""')
    .list
        button.item(v-for='(video, index) in videos' :key='index' :class='video.av === av ? "active" : ""' @click='goto(video.av)')
            .index {{ index + 1 }}
            .name {{ video.name }}
            .length {{ video.length }}
    .footer
        .logo
        button.text(@click='next(false)' :title='nextVideoName')
            span.list-name {{ list.name }}
            span.next-up {{ nextVideoName }}
        button.toggle-list(@click='expanded = !expanded')
</template>

<script lang="ts">
import Vue from 'vue'
import $ from 'cash-dom'
import {
    generateVideoURL,
    shuffleVideos,
    intervalTest
} from '../js/utils'
import {
    defaultDataStore,
    IListModel,
    IVideoModel
} from '../js/storage'
import { AnalyticsVideoPage } from '../js/analytics'
const core = new AnalyticsVideoPage()

import {
    videoPageURLReg,
    videoSelector,
    videoPageDanmakuRowSelector,
    videoNotFoundNoticeSelector
} from '../js/strategy/video.strategy'

export default Vue.extend({
    data () {
        return {
            store: defaultDataStore,
            valid: false,
            av: 0,
            listID: '',
            seed: '0',
            expanded: false
        }
    },

    computed: {
        list (): IListModel {
            return this.store.lists[this.listID] || { }
        },

        videos (): IVideoModel[] {
            const vids = this.list.vids || []
            return shuffleVideos(vids, this.seed)
        },

        videosIndexMap (): { [key: number]: number } {
            return this.videos.map((vid, index) => {
                return {
                    [vid.av]: index
                }
            }).reduce((a, c) => {
                return { ...a, ...c }
            }, { })
        },

        nextVideoIndex (): number {
            const current = this.videosIndexMap[this.av] || 0
            return current === this.videos.length - 1 ? 0 : current + 1
        },

        nextVideoName (): string {
            return (this.videos[this.nextVideoIndex] || { }).name || ''
        },

        nextVideoURL (): string {
            return generateVideoURL(this.listID, this.videos[this.nextVideoIndex].av, this.seed)
        }
    },

    methods: {
        validateURL () {
            const url = document.URL
            this.valid = videoPageURLReg.test(url)
            if (!this.valid) return
            const [_ = '', av = '0', listID = '', seed = '0'] = videoPageURLReg.exec(url) || []
            this.av = parseInt(av)
            this.listID = listID
            this.seed = seed
        },

        open (url: string) {
            window.location.replace(url)
        },

        next (auto = true) {
            core.logPlayNextVideo(auto)
            this.open(this.nextVideoURL)
        },

        goto (av: string | number) {
            core.logPlayAnotherVideo()
            this.open(generateVideoURL(this.listID, av, this.seed))
        }
    },

    created () {
        this.store = core.store
        core.addStoreChangesListener(store => this.store = store)
        this.validateURL()
    },

    mounted () {
        let video: HTMLVideoElement
        intervalTest(() => {
            video = $(videoSelector)[0]
            return video !== undefined
        }, 50, 70).then(() => {
            video.preload = 'auto'
            video.addEventListener('ended', () => {
                if (!this.valid) return
                this.next()
            })
            video.addEventListener('emptied', this.validateURL)
            // Wait until danmuku loads
            intervalTest(
                () => $(videoPageDanmakuRowSelector)[0] !== undefined
            , 100, 40, 2000).then(() => {
                if (!this.valid) return
                video.play()
            }).catch(reason => {
                // Start playing anyway if something wrong happened
                if (!this.valid) return
                video.play()
            })
        }).catch(reason => {
            prompt(reason)
        })
        // This video is gone, skip it
        intervalTest(
            () => $(videoNotFoundNoticeSelector)[0] !== undefined,
        ).then(() => this.next()).catch(() => { })
    }
})
</script>

<style lang="less" scoped>
@import url('../css/universal.less');
@import url('../css/tokens.less');
@import url('../css/utils.less');

* {
    position: relative;
    box-sizing: border-box;
}

.bl-video-toolbar {
    @barw: 320px;
    width: @barw;
    height: 48px;
    position: fixed;
    bottom: 0;
    border-radius: 4px 4px 0 0;
    background-color: @white;
    box-shadow: 0 0 0 1px @azure-divider;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    z-index: 20000;

    @wrapperw: 1312px;
    @narroww: 1464px;
    @media screen and (min-width: @narroww) {
        transform: translateX(@wrapperw / 2 - @barw / 2);
        margin: auto;
        left: 0;
        right: 0;
    }

    @media screen and (max-width: @narroww) {
        right: 76px;
    }

    .footer {
        .flex-h(48px);
        box-shadow: 0 -1px 0 0 @azure-divider;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding-left: 16px;

        .logo {
            .flex-w(10px);
            .flex-h(14px);
            background-image: url('../img/content-page/BL.svg');
            background-size: contain;
            background-repeat: no-repeat;
        }

        .text {
            width: 100%;
            height: 100%;
            margin-left: 16px;
            padding-right: 12px;
            text-align: left;
            overflow: hidden;

            span {
                display: block;
            }

            .list-name {
                width: 100%;
                font-size: 10px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .next-up {
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                color: @azure;

                &::before {
                    content: '接下来: ';
                    color: @black-secondary;
                }
            }
        }

        .toggle-list {
            .flex-w(50px);
            height: 100%;
            background-image: url('../img/content-page/list.svg');
            background-repeat: no-repeat;
            background-position: center;
        }
    }

    .list {
        height: 100%;
        overflow-x: hidden;
        overflow-y: auto;

        .item {
            width: 100%;
            height: 40px;
            padding: 0 12px;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            overflow: hidden;

            .index {
                .flex-w(32px);
                color: @azure;
                text-align: center;
            }

            .name {
                width: 100%;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                margin-left: 8px;
                margin-right: 8px;
                text-align: left;
                color: @black;
            }

            .length {
                .flex-w(60px);
                text-align: center;
                color: @black-secondary;
            }

            &:first-child {
                margin-top: 8px;
            }

            &:last-child {
                padding-bottom: 8px;
            }

            &.active {
                .index {
                    color: transparent;
                    background-image: url('../img/content-page/play.svg');
                    background-position: center;
                    background-repeat: no-repeat;
                }
            }
        }
    }

    &.expanded {
        height: 392px;
    }
}
</style>

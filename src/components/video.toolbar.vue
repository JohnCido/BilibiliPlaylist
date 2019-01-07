<template lang="pug">
.bl-video-toolbar(v-show='valid')
    .list
    .footer
        .logo
        button.text(@click='next' :title='nextVideoName')
            span.list-name {{ list.name }}
            span.next-up {{ nextVideoName }}
        button.toggle-list
</template>

<script lang="ts">
import Vue from 'vue'
import $ from 'cash-dom'
import {
    whilst
} from 'async'
import {
    generateVideoURL,
    shuffleVideos
} from '../js/utils'
import CoreStore, {
    defaultDataStore,
    IListModel,
    IVideoModel
} from '../js/storage'
import {
    videoPageURLReg,
    videoSelector
} from '../js/strategy/video.strategy'
const coreStore = new CoreStore()

export default Vue.extend({
    data () {
        return {
            store: defaultDataStore,
            valid: false,
            av: 0,
            listID: '',
            seed: '0'
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

        next () {
            this.open(this.nextVideoURL)
        }
    },

    created () {
        this.store = coreStore.store
        coreStore.onChanged(store => this.store = store)
        this.validateURL()
    },

    mounted () {
        let video: HTMLVideoElement
        whilst(() => video === undefined, callback => {
            video = $(videoSelector)[0]
            callback()
        }, err => {
            if (err) { return }
            video.preload = 'auto'
            video.autoplay = true
            video.addEventListener('ended', this.next)
            video.play()
        })
    }
})
</script>

<style lang="less" scoped>
@import url('../css/universal.less');
@import url('../css/tokens.less');
@import url('../css/utils.less');

.bl-video-toolbar {
    width: 320px;
    height: 48px;
    margin: auto;
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 4px 4px 0 0;
    background-color: @white;
    box-shadow: 0 0 0 1px @azure-divider;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    z-index: 20000;

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
        overflow-y: auto;
    }
}
</style>

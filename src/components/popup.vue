<template lang="pug">
mdc-layout-app
    mdc-toolbar(slot="toolbar")
        mdc-toolbar-row
            mdc-toolbar-section(align-start)
                mdc-toolbar-title 哔哩列表
            mdc-toolbar-section(align-end)
                mdc-toolbar-icon(:icon="editing ? 'delete_forever' : 'edit'" @click='action1' v-show="lists.length !== 0")
                mdc-toolbar-icon(:icon="editing ? 'check' : 'settings'" @click='action2')

    main
        section(class="lists")
            div(class="empty" v-if="lists.length === 0")
                div(class="content")
                    div(class="face")
                    mdc-body 看什么看，没有列表
                    mdc-button(@click="open('https://www.bilibili.com')") 打开 B 站
            mdc-list(v-for="(list, index) in lists" :key="index" dense two-line class="list")
                mdc-list-item
                    span {{ list.name }}
                    span(slot="secondary") {{ `${list.priv ? '私人' : '公开'} · ${list.vids.length}个视频` }}
                    span(slot="end-detail")
                        mdc-button(icon shuffle v-if="!editing" @click="shuffle(`${list.id}`)")
                            mdc-icon(icon="shuffle")
                        mdc-button(icon action @click="itemAction(`${list.id}`)")
                            mdc-icon(:icon="editing ? 'delete' : 'play_arrow'")
    
    settings(ref="settings")

    mdc-dialog(ref="dialogClear" title="确定要删除所有列表？" accept="清除" @accept="clear" cancel="取消") 请注意此操作不可撤销
</template>

<script>
import Amplitude from 'amplitude-js'
import * as amplitudeTypes from '../js/analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

import Settings from './settings'
import randomString from 'randomstring'
import series from 'async/series'
import util from '../js/util'

export default {
    data () {
        return {
            lists: [],
            editing: false
        }
    },
    methods: {
        action1 () {
            if (this.editing) {
                //Delete all
                this.$refs.dialogClear.show()
            } else {
                //Edit
                this.editing = true
            }
        },
        action2 () {
            if (this.editing) {
                //Done
                this.editing = false
            } else {
                //Settings
                this.$refs.settings.show()
            }
        },
        clear() {
            let self = this
            var usage

            series([
                cb => {
                    chrome.storage.local.get('usage', obj => {
                        usage = obj.usage
                        cb()
                    })
                },
                cb => {
                    chrome.storage.local.clear(() => {
                        amplitudeInstance.logEvent(amplitudeTypes.PLAYLIST_DELETE_ALL, {
                            from: 'popup'
                        })
                        self.editing = false
                        self.lists = []
                        cb()
                    })
                },
                cb => {
                    chrome.storage.local.set({ usage: usage })
                }
            ])
        },
        shuffle(id) {
            amplitudeInstance.logEvent(amplitudeTypes.PLAY_SHUFFLE, {
                from: 'favorite'
            })
            open(id, true)
        },
        itemAction(id) {
            let self = this
            if (this.editing) {
                //Delete
                chrome.storage.local.remove(id, () => {
                    amplitudeInstance.logEvent(amplitudeTypes.PLAYLIST_DELETE, {
                        from: 'popup'
                    })
                    self.load()
                })
            } else {
                //Play
                amplitudeInstance.logEvent(amplitudeTypes.PLAY_QUEUE, {
                    from: 'favorite'
                })
                open(id, false)
            }
        },
        load() {
            let self = this
            chrome.storage.local.get(null, local => {
                delete local.usage
                self.lists = Object.values(local)
            })
        },
        open(url) {
            window.open(url)
        }
    },
    created () {
        this.load()
    },
    components: {
        Settings
    }
}

function open(id, shuffle) {
    chrome.storage.local.get(id, (obj) => {
        var list = obj[id], url
        if (shuffle) {
            let seed = randomString.generate(5)
            util.shuffle(list.vids, seed)
            url = `https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${id}&seed=${seed}`
        } else {
            url = `https://www.bilibili.com/video/av${list.vids[0].av}/?bpid=${id}&seed=0`
        }
        window.open(url)
    })
}
</script>

<style lang="less" scoped>
@import url('../css/basic.less');

.mdc-layout-app {
    z-index: 1;
}

.mdc-layout-app--toolbar-wrapper {
    min-height: 56px;

    .mdc-toolbar-title {
        color: white;
    }

    .mdc-toolbar-icon {
        color: white;

        &::before {
            background-color: fade(white, 40);
        }

        &::after {
            background-color: fade(white, 40);
        }
    }
}

main {
    height: 100%; max-height: 344px;
}

.lists {
    width: 100%; height: 100%;
    position: relative;
    overflow-y: auto;

    .empty {
        width: 100%; height: 100%;
        position: absolute;
        z-index: 2;

        .content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            display: flex; flex-direction: column;
            align-items: center;

            .face {
                width: 72px; height: 72px;
                border-radius: 8px 36px 36px 36px;
                box-shadow: inset 0 0 0 2px @blue;
                background-image: url('../img/popup/face/1@2x.jpg');
                background-position: center; background-repeat: no-repeat; background-size: contain;
            }

            .mdc-body {
                margin-top: 12px;
            }

            .mdc-button {
                &::before {
                    background-color: fade(@blue, 24);
                }

                &::after {
                    background-color: fade(@blue, 24);
                }
            }
        }
    }

    .list {
        .mdc-list-item {
            padding-right: 4px;
        }

        &:hover {
            .mdc-button {
                &[shuffle] {
                    opacity: 1;
                }

                &::before {
                    background-color: fade(@blue, 24);
                }

                &::after {
                    background-color: fade(@blue, 24);
                }
            }
        }

        .mdc-button {
            &[shuffle] {
                opacity: 0;
                transition: opacity ease 0.07s;
            }
        }
    }
}
</style>

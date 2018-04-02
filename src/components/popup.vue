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
            mdc-list(v-for="(list, index) in lists" :key="index" dense two-line class="list")
                mdc-list-item
                    span {{ list.name }}
                    span(slot="secondary") {{ `${list.priv ? '私人' : '公开'} · ${list.vids.length}个视频` }}
                    span(slot="end-detail")
                        mdc-button(icon shuffle v-if="!editing" @click="shuffle(`${list.id}`)")
                            mdc-icon(class="material-icons") shuffle
                        mdc-button(icon action @click="itemAction(`${list.id}`)")
                            mdc-icon(class="material-icons") {{ editing ? 'delete' : 'play_arrow' }}
    
    mdc-dialog(ref="dialogClear" title="确定要删除所有列表？" accept="清除" @accept="clear" cancel="取消") 请注意此操作不可撤销
</template>

<script>
import Amplitude from 'amplitude-js'
import * as amplitudeTypes from '../js/analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

import Settings from './settings'
import randomString from 'randomstring'
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
            }
        },
        clear() {
            let self = this
            chrome.storage.local.clear(() => {
                amplitudeInstance.logEvent(amplitudeTypes.PLAYLIST_DELETE_ALL, {
                    from: 'popup'
                })
                self.editing = false
                self.lists = []
            })
        },
        shuffle(id) {
            amplitudeInstance.logEvent(amplitudeTypes.PLAY_SHUFFLE, {
                from: 'favorite'
            })
            open(id, true)
        },
        itemAction(id) {
            let self = this
            console.log(id)
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
                self.lists = Object.values(local)
            })
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

.mdc-layout-app--toolbar-wrapper {
    min-height: 56px;
}

main {
    height: 100%; max-height: 344px;
}

.lists {
    width: 100%; height: 100%;
    overflow-y: auto;

    .empty {
        width: 100%; height: 100%;
        position: absolute;
        z-index: 2;
    }

    .list {
        .mdc-list-item {
            padding-right: 12px;
        }

        &:hover {
            .mdc-button {
                &[shuffle] {
                    opacity: 1;
                }
            }
        }

        .mdc-button {
            min-width: 24px;
            width: 36px; height: 36px;
            border-radius: 50%;

            &[shuffle] {
                opacity: 0;
                transition: opacity ease 0.07s;
                margin-right: 12px;
            }
        }

        .mdc-icon {
            width: 24px; height: 24px;
            margin: 0;
        }
    }
}
</style>

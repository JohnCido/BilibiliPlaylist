<template lang="pug">
transition(name="page")
    section(class="settings" v-if="visible")
        mdc-toolbar(style="grid-row: 1;")
            mdc-toolbar-row
                mdc-toolbar-section(align-start)
                    mdc-toolbar-menu-icon(icon="arrow_back" @click="visible=false")
                    mdc-toolbar-title 设置

        mdc-list(two-line dense)
            mdc-list-item
                span 发送匿名使用统计
                span(slot="secondary") 追踪使用状况以进行调整和优化
                mdc-switch(slot="end-detail" v-model="usage")
            mdc-list-divider
            mdc-list-group-header 开放源代码许可
            mdc-list-item(class="license-item" v-for="(license, name) in licenses" :key="name")
                span {{ name }}
                span(slot="secondary") {{ license.licenses }}
                mdc-button(icon slot="end-detail" @click="open(license.licenseUrl)")
                    mdc-icon(icon="open_in_new")
            footer
                div(class="long")
                mdc-body 你都翻到这儿了，要不要
                mdc-button(@click="open('https://space.bilibili.com/1528379')") 关注我的账号
</template>

<script>
import Amplitude from 'amplitude-js'
import * as amplitudeTypes from '../js/analytics.types'
let amplitudeInstance = Amplitude.getInstance()
amplitudeInstance.init(amplitudeTypes.API_KEY)

const licenses = require('../../licenses.json')

export default {
    data () {
        return {
            visible: false,
            licenses: licenses,
            usage: true
        }
    },
    methods: {
        show () {
            this.visible = true
        },
        open(url) {
            window.open(url)
        }
    },
    created() {
        let self = this
        chrome.storage.local.get('usage', obj => {
            self.usage = obj.usage
        })
    },
    watch: {
        usage (n, o) {
            chrome.storage.local.set({ 'usage': n }, () => {
                amplitudeInstance.setOptOut(!n)
            })
        }
    }
}
</script>

<style lang="less" scoped>
@import url('../css/basic.less');

.settings {
    width: 100%; height: 100%; max-height: 100%;
    position: fixed; top: 0; left: 0;
    z-index: 2; overflow: hidden;
    display: grid;
    grid-template-rows: 56px 1fr;
    box-shadow: 0 0 8px 0 fade(black, 12), 0 8px 8px fade(black, 24);
    z-index: 2;
}

header {
    .mdc-toolbar-menu-icon{
        margin: 0;
        color: white;
    }

    .mdc-toolbar-title {
        color: white;
    }
}

.mdc-list {
    grid-row: 2;
    background: white;
    overflow: auto;
    padding-bottom: 32px;
}

.license-item {
    padding-right: 4px;

    .mdc-button {
        &::before {
            background-color: fade(@blue, 24);
        }

        &::after {
            background-color: fade(@blue, 24);
        }
    }
}

footer {
    display: flex; flex-direction: column;
    align-items: center; margin-top: 24px;

    .long {
        width: 72px; height: 8000px;
        border-radius: 8px 36px 36px 36px;
        box-shadow: inset 0 0 0 2px @blue;
        background-image: url('../img/popup/face/2@2x.jpg');
        background-size: contain; background-position: bottom center; background-repeat: no-repeat;
    }
}

.page-enter-active {
    transition: all ease-out .35s;
}
.page-leave-active {
    transition: all ease-in .2s;
}
.page-leave, .page-enter-to {
    transform: translateX(0);
}
.page-enter, .page-leave-to {
    transform: translateX(100%);
}
</style>

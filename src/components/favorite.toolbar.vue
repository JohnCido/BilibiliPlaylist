<template lang="pug">
.bl-toolbar-stripe
    button.icon.fetch(title='缓存为列表')
    button.icon.play(title='顺序播放')
    button.icon.shuffle(title='随机播放')
    button.bl
</template>

<script lang="ts">
import Vue from 'vue'
import { browser } from 'webextension-polyfill-ts'
import { CoreStore } from '../js/core'
const coreStore = new CoreStore()

export default Vue.extend({
    computed: {
        store () {
            return coreStore.store
        }
    },

    methods: {
        
    }
})
</script>

<style lang="less" scoped>
@import url('../css/tokens.less');
@import url('../css/universal.less');

.bl-toolbar-stripe {
    @w: 40px;
    width: @w;
    height: auto;
    padding: 6px 0;
    position: absolute;
    top: 0;
    right: -(@w + 11);
    border-radius: 4px;
    background-color: @white;
    box-shadow: 0 0 0 1px @azure-divider;

    button {
        width: 100%;
        background-position: center;
        background-repeat: no-repeat;

        &.icon {
            height: 34px;

            &.fetch {
                background-image: url('../img/content-page/get_app.svg');
            }

            &.play {
                background-image: url('../img/content-page/play.svg');
            }

            &.shuffle {
                background-image: url('../img/content-page/shuffle.svg');
            }
        }

        &.bl {
            height: 22px;
            margin-top: 8px;
            background-image: url('../img/content-page/BL.svg');
            background-size: 10px 14px;
            pointer-events: none;
        }
    }
}
</style>


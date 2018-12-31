<template lang="pug">
.bl-toolbar-stripe(v-show='fid !== undefined')
    button.icon(title='缓存为列表' :class='isFIDCached ? "sync" : "fetch"')
    button.icon.play(title='顺序播放')
    button.icon.shuffle(title='随机播放')
    button.bl
</template>

<script lang="ts">
import Vue from 'vue'
import { browser } from 'webextension-polyfill-ts'
import $ from 'cash-dom'
import {
    currentFavItemSelector,
    fidRefreshTriggerSelector
} from '../js/strategy/favorite.strategy'
import CoreStore, { defaultDataStore } from '../js/storage'
const coreStore = new CoreStore()

export default Vue.extend({
    data () {
        return {
            store: defaultDataStore,
            fid: '0'
        }
    },

    computed: {
        isFIDCached (): boolean {
            return this.store.lists[this.fid] !== undefined
        }
    },

    methods: {
        refreshFID () {
            const cur = $(currentFavItemSelector)
            this.fid = cur.attr('fid')
        }
    },

    created () {
        this.store = coreStore.store
        coreStore.onChanged(store => this.store = store)
    },

    mounted () {
        this.refreshFID()
        $(fidRefreshTriggerSelector).on('click', () => setTimeout(this.refreshFID, 100))
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

            &.sync {
                background-image: url('../img/content-page/sync.svg');
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


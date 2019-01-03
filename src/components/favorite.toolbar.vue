<template lang="pug">
.bl-toolbar-stripe(v-show='fid !== undefined')
    button.icon(title='缓存为列表' :class='isFIDCached ? "sync" : "fetch"' @click='save')
    button.icon.play(title='顺序播放')
    button.icon.shuffle(title='随机播放')
    button.bl

    .bl-processing-overlay(v-show='')
</template>

<script lang="ts">
import Vue from 'vue'
import $ from 'cash-dom'
import {
    currentFavItemSelector,
    favItemIDAttrKey,
    fidRefreshTriggerSelector
} from '../js/strategy/favorite.strategy'
import {
    crawlList
} from '../js/content-page/favorite.crawler'
import CoreStore, {
    defaultDataStore,
    IListModel
} from '../js/storage'
const coreStore = new CoreStore()

export default Vue.extend({
    data () {
        return {
            store: defaultDataStore,
            fid: '0',
            processing: false
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
            this.fid = cur.attr(favItemIDAttrKey)
        },
        save () {
            this.processing = true
            crawlList().then((list: IListModel) => {
                coreStore.updateList(list)
                this.processing = false
            }).catch(reason => {
                this.processing = false
                alert(reason)
            })
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

.bl-processing-overlay {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 20000;
}
</style>


<template lang="pug">
.bl-video-toolbar
    .list
    .footer
        .logo
        button.text
            .list-name
            .next-up
        button.list
</template>

<script lang="ts">
import Vue from 'vue'
import {
    generateVideoURL
} from '../js/utils'
import CoreStore, {
    defaultDataStore,
    IListModel
} from '../js/storage'
const coreStore = new CoreStore()

export default Vue.extend({
    data () {
        return {
            store: defaultDataStore
        }
    },

    created () {
        this.store = coreStore.store
        coreStore.onChanged(store => this.store = store)
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
        padding:  0 12px 0 16px;

        .logo {
            .flex-w(10px);
            .flex-h(14px);
            background-image: url('../img/content-page/BL.svg');
            background-size: contain;
            background-repeat: no-repeat;
        }

        .text {
            width: 100%;
            margin-left: 16px;
            margin-right: 12px;
            text-align: left;
            overflow: hidden;

            .list-name {
                width: 100%;
                font-size: 10px;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .next-up {
                width: 100%;
                font-size: 12px;
                overflow: hidden;
                text-overflow: ellipsis;
                color: @azure;

                &::before {
                    content: '接下来: ';
                    color: @black-secondary;
                }
            }
        }
    }

    .list {
        height: 100%;
        overflow-y: auto;
    }
}
</style>

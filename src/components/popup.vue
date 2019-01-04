<template lang="pug">
#app
    header
        .logo
        button.icon(:class='headerIconClassNameA' @click='headerActionA' :disabled='isListEmpty')
        button.icon(:class='headerIconClassNameB' @click='headerActionB')
    #app-content
        #lists(:class='showSettings ? "slide-down" : ""')
            .list
                .cell(v-for='list in lists' :key='list.id')
                    .text
                        .title {{ list.name }}
                        .subtitle {{ list.private ? '私人' : '公开' }} · {{ list.vids.length }} 个视频
                    button.icon.shuffle(v-show='!editing' @click='listItemActionA(list.id)')
                    button.icon(:class='listItemIconClassNameB' @click='listItemActionB(list.id)')
            .disable-scrim(v-show='showSettings' @click='showSettings = false')
        #empty(v-show='isListEmpty')
            span 看什么看，没有列表
            a.add(href='https://bilibili.com')
        footer
            div
                .cell.dark
                    .text
                        .title 发送匿名使用统计
                        .subtitle 协助统计功能使用情况
                    button.icon(:class='usage ? "check_circle_fill" : "circle"' @click='toggleUsageSetting')
                .cell.dark
                    .text
                        .title 开放源代码许可
                    button.icon.open_in_new
                .cell.dark
                    .text
                        .title 我的 B 站空间
                    button.icon.open_in_new

            .copyright 版权所有 © 2019 John Cido.<br/>保留所有你能想到或者想不到的解释权。
</template>

<script lang="ts">
import Vue from 'vue'
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
            processing: false,
            editing: false,
            showSettings: false
        }
    },

    computed: {
        lists (): IListModel[] {
            return Object.values(this.store.lists)
        },

        isListEmpty (): boolean {
            return this.lists.length === 0
        },

        headerIconClassNameA (): string {
            return this.editing ? 'check' : this.showSettings ? 'heart' : 'edit'
        },

        headerIconClassNameB (): string {
            return this.editing ? 'delete_all' : this.showSettings ? 'arrow_up' : 'settings'
        },

        listItemIconClassNameB (): string {
            return this.editing ? 'delete' : 'play'
        },

        usage (): boolean {
            return this.store.usage
        }
    },

    methods: {
        headerActionA () {
            switch (this.headerIconClassNameA) {
            case 'check':
                // Done editing
                this.editing = false
                break
            case 'heart':
                // Show Chrome Web Store rate page
                break
            case 'edit':
                // Start editing
                this.editing = true
                break
            default:
                break
            }
        },

        headerActionB () {
            switch (this.headerIconClassNameB) {
            case 'delete_all':
                // Delete all lists
                coreStore.removeAllLists()
                this.editing = false
                break
            case 'arrow_up':
                // Close settings
                this.showSettings = false
                break
            case 'settings':
                // Show settings
                this.showSettings = true
                break
            default:
                break
            }
        },

        listItemActionA (id: string | number) {
            // Shuffle play the list
        },

        listItemActionB (id: string | number) {
            switch (this.listItemIconClassNameB) {
            case 'delete':
                // Delete a single list
                coreStore.removeList(id)
                break
            case 'play':
                // Play the list
                break
            default:
                break
            }
        },

        toggleUsageSetting () {
            coreStore.set('usage', !this.usage)
        }
    },

    created () {
        this.store = coreStore.store
        coreStore.onChanged(store => this.store = store)
    }
})
</script>

<style lang="less">
@import url('../css/universal.less');
@import url('../css/tokens.less');
@import url('../css/utils.less');

* {
    position: relative;
    box-sizing: border-box;
}

button, a {
    cursor: pointer;
}

#app {
    width: inherit;
    height: inherit;
    overflow: hidden;
    background-color: @azure;
    display: flex;
    flex-direction: column;
    align-items: stretch;

    #app-content {
        height: 100%;
    }
}

header {
    .flex-h(48px);
    padding: 0 10px 0 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .logo {
        width: 100%;
        .flex-h(24px);
        background-image: url('../img/popup/header_logo.svg');
        background-repeat: no-repeat;
        background-position: left center;
    }
}

#lists {
    z-index: 2;
    width: 100%;
    height: 100%;
    max-height: 100%;
    overflow-y: auto;
    padding-top: 4px;
    border-radius: 4px 4px 0 0;
    background-color: @white;
    box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
    transition: all ease-out .22s;

    &.slide-down {
        transform: translateY(220px);
    }

    .list {
        z-index: 1;
    }

    .disable-scrim {
        .absolute-full;
        background-color: @white-disabled;
        cursor: pointer;
        z-index: 2;
    }
}

button.icon {
    .flex-w(30px);
    min-height: 32px;
    background-repeat: no-repeat;
    background-position: center;
    float: left;

    &.settings {
        background-image: url('../img/popup/settings.svg');
    }

    &.delete_all {
        background-image: url('../img/popup/delete_all.svg');
    }

    &.arrow_up {
        background-image: url('../img/popup/arrow_up.svg');
    }

    &.edit {
        background-image: url('../img/popup/edit.svg');
    }

    &.check {
        background-image: url('../img/popup/check.svg');
    }

    &.heart {
        background-image: url('../img/popup/heart.svg');
    }

    &.shuffle {
        background-image: url('../img/popup/shuffle.svg');
    }

    &.play {
        background-image: url('../img/popup/play.svg');
    }

    &.delete {
        background-image: url('../img/popup/delete.svg');
    }

    &.circle {
        background-image: url('../img/popup/circle.svg');
    }

    &.check_circle_fill {
        background-image: url('../img/popup/check_circle_fill.svg');
    }

    &.open_in_new {
        background-image: url('../img/popup/open_in_new.svg');
    }


    &:disabled {
        opacity: .32;
        cursor: not-allowed;
    }
}

.cell {
    width: 100%;
    min-height: 48px;
    padding: 10px 10px 10px 16px;
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    overflow: hidden;

    .text {
        width: 100%;
        color: @black;
        overflow: hidden;

        .title {
            font-size: 12px;
            color: inherit;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .subtitle {
            font-size: 11px;
            color: inherit;
            opacity: .36;
        }
    }

    &::after {
        content: '';
        display: block;
        .absolute-size(unset, 0, 0, 16px);
        height: 1px;
        background-color: @azure-divider;
    }

    &.dark {
        .text {
            color: @white;

            .subtitle {
                opacity: .52;
            }
        }

        &::after {
            background-color: @white-divider;
        }
    }

    &:last-child {
        &::after {
            display: none;
        }
    }
}

#empty {
    .absolute-full;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 3;

    span {
        font-size: 12px;
        text-align: center;
        color: @black;
    }

    .add {
        display: block;
        width: 48px;
        height: 48px;
        margin-top: 16px;
        border-radius: 50%;
        background-image: url('../img/popup/add.svg');
        background-position: center;
        background-repeat: no-repeat;
        background-color: fade(@azure, 4);
        box-shadow: 0 0 0 8px fade(@azure, 4);
    }
}

footer {
    .absolute-full;
    z-index: 1;

    .copyright {
        text-align: center;
        font-size: 10px;
        color: @white-disabled;
        margin-top: 12px;
    }
}
</style>

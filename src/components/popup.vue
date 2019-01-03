<template lang="pug">
#app
</template>

<script lang="ts">
import Vue from 'vue'
import CoreStore, {
    defaultDataStore
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

    created () {
        this.store = coreStore.store
        coreStore.onChanged(store => this.store = store)
    }
})
</script>

<style lang="less">
@import url('../css/tokens.less');

#app {
    width: inherit;
    height: inherit;
    overflow: hidden;
    background-color: @azure;
}
</style>

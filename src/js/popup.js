import Vue from 'vue'
import '../css/mdc.scss'
import VueMDCAdapter from 'vue-mdc-adapter'
Vue.use(VueMDCAdapter)

new Vue({
    el: '#app',
    render: r => r(require('../components/popup.vue').default)
})
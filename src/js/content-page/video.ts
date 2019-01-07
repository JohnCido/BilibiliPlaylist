import Vue from 'vue'
import $ from 'cash-dom'
import toolbar from '../../components/video.toolbar.vue'
import {
    toolbarVueRootID
} from '../strategy/video.strategy'

$('body').append(`<div id='${toolbarVueRootID}'></div>`)
new Vue({
    el: `#${toolbarVueRootID}`,
    render: r => r(toolbar)
})

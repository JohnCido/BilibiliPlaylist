import Vue from 'vue'
import $ from 'cash-dom'
import strategy from '../strategy/favorite.strategy.json'
import toolbar from '../../components/favorite.toolbar.vue'
import { intervalTest } from '../utils'

init()

function init () {
    if (!new RegExp(strategy.favPageURLReg).test(document.URL)) return

    intervalTest(() => {
        const root = $(strategy.toolbarRoot)
        return root !== undefined && root !== null
    }, 100, 0).then(() => {
        const root = $(strategy.toolbarRoot)
        root.append(`<div id='${strategy.toolbarVueRootID}'></div>`)
        new Vue({
            el: `#${strategy.toolbarVueRootID}`,
            render: r => r(toolbar)
        })
    })
}

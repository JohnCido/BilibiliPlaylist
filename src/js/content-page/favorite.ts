import Vue from 'vue'
import $ from 'cash-dom'
import * as strategy from '../strategy/favorite.strategy'
import toolbar from '../../components/favorite.toolbar.vue'
import { intervalTest } from '../utils'

init()

intervalTest(() => {
    const wrapper = $(strategy.initRefreshNavTriggerSelector)[0]
    return wrapper !== undefined
}, 200, 200, 10000).then(() => {
    $(strategy.initRefreshNavTriggerSelector)[0].onclick = () => {
        setTimeout(init, 200)
    }
}).catch(() => { })

function init () {
    if (!new RegExp(strategy.favPageURLReg).test(document.URL)) return
    if ($(`#${strategy.toolbarVueRootID}`)[0]) return

    intervalTest(() => {
        const root = $(strategy.toolbarRootSelector)[0]
        return root !== undefined
    }, 800, 100, 15000).then(() => {
        const root = $(strategy.toolbarRootSelector)
        root.append(`<div id='${strategy.toolbarVueRootID}'></div>`)
        new Vue({
            el: `#${strategy.toolbarVueRootID}`,
            render: r => r(toolbar)
        })
    }).catch(() => { })
}

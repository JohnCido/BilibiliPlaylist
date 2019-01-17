import Vue from 'vue'
import $ from 'cash-dom'
import {
    initRefreshNavTriggerSelectors,
    favPageURLReg,
    toolbarRootSelector,
    toolbarVueRootID
} from '../strategy/favorite.strategy'
import toolbar from '../../components/favorite.toolbar.vue'
import { intervalTest } from '../utils'

import * as Sentry from '@sentry/browser'
import { DSN } from '../diagnostics'
Sentry.init({
    dsn: DSN,
    integrations: [new Sentry.Integrations.Vue({ Vue })]
})

init()

initRefreshNavTriggerSelectors.map(selector => intervalTest(() => {
    const wrapper = $(selector)[0]
    return wrapper !== undefined
}, 200, 200, 10000).then(() => {
    $(selector).on('click', () => {
        setTimeout(init, 200)
    })
}).catch(() => { }))

function init () {
    if (!new RegExp(favPageURLReg).test(document.URL)) return
    if ($(`#${toolbarVueRootID}`)[0]) return

    intervalTest(() => {
        const root = $(toolbarRootSelector)[0]
        return root !== undefined
    }, 800, 100, 15000).then(() => {
        const root = $(toolbarRootSelector)
        root.append(`<div id='${toolbarVueRootID}'></div>`)
        new Vue({
            el: `#${toolbarVueRootID}`,
            render: r => r(toolbar)
        })
    }).catch(() => { })
}

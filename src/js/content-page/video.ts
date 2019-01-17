import Vue from 'vue'
import $ from 'cash-dom'
import toolbar from '../../components/video.toolbar.vue'
import {
    toolbarVueRootID
} from '../strategy/video.strategy'

import * as Sentry from '@sentry/browser'
import { DSN } from '../diagnostics'
Sentry.init({
    dsn: DSN,
    integrations: [new Sentry.Integrations.Vue({ Vue })]
})

$('body').append(`<div id='${toolbarVueRootID}'></div>`)
new Vue({
    el: `#${toolbarVueRootID}`,
    render: r => r(toolbar)
})

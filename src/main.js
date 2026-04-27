// src/main.js
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import routes from '~pages'

import './assets/main.css'

export const createApp = ViteSSG(
    App,
    {
        routes,
        scrollBehavior(to, from, savedPosition) {
            if (to.hash) return { el: to.hash, behavior: 'smooth', top: 60 }
            return { top: 0 }
        }
    },
    ({ app, router, isClient }) => {
    }
)
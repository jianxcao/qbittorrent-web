import { createApp } from 'vue'
import 'uno.css'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './store'
import VueVirtualScroller from 'vue-virtual-scroller'
import VTouch from '@any-touch/vue3'
import i18n from './i18n'
window.router = router

const app = createApp(App)
app.use(VTouch)
app.use(VueVirtualScroller)
app.use(router)
app.use(pinia)
app.use(i18n)

app.mount('#app')

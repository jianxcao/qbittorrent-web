/// <reference types="vite/client" />
/// <reference types="vite-svg-loader" />

declare module 'vue-virtual-scroller'

// 全局版本号变量
declare const __APP_VERSION__: string

declare interface Window {
  router: import('vue-router').Router
}

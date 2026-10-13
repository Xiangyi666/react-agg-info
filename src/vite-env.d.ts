/// <reference types="vite/client" />
// 实际上是vite-plugin-pages在生成routes，此处是为了做ts声明，让这个虚拟模块不报错
// 此模块而是 vite-plugin-pages 插件在构建时动态生成的
declare module '~react-pages' {
  import type { RouteObject } from 'react-router-dom'
  const routes: RouteObject[]
  export default routes
}

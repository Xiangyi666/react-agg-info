/**
 * resume 功能的类型统一出口：所有类型定义集中在 types/ 目录，
 * 消费方一律从 '../types'（或对应相对路径）导入，不感知内部文件划分。
 * 新增类型定义：加 types/<领域>.ts，并在下方 `export *` 一行。
 */
export * from './resume'
export * from './section'

import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

type FallbackRender = (props: { error: Error; reset: () => void }) => ReactNode

type ErrorBoundaryProps = {
  children: ReactNode
  /** 自定义兜底 UI（ReactNode 或渲染函数）；不传则用内置默认兜底 */
  fallback?: ReactNode | FallbackRender
  onError?: (error: Error, info: ErrorInfo) => void
}

type ErrorBoundaryState = {
  error: Error | null
}

/**
 * 错误边界：捕获子组件树在渲染/生命周期阶段的错误，避免局部错误卸载整棵组件树。
 * React 仅提供 class 形式的错误边界（依赖 getDerivedStateFromError 生命周期），无 hooks 版本。
 * 注意：不捕获事件处理函数、异步代码（setTimeout / Promise reject）、以及边界自身抛出的错误。
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary 捕获到渲染错误:', error, info.componentStack)
    this.props.onError?.(error, info)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (error === null) {
      return this.props.children
    }

    const { fallback } = this.props
    if (typeof fallback === 'function') {
      return fallback({ error, reset: this.reset })
    }
    if (fallback !== undefined) {
      return fallback
    }

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <p className="text-base font-medium text-gray-800">error</p>
        <p className="max-w-md text-sm text-gray-500">{error.message}</p>
        <button
          type="button"
          onClick={this.reset}
          className="rounded-md bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200"
        >
          重试
        </button>
      </div>
    )
  }
}

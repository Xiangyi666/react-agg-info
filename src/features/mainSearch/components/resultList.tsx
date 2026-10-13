import type { result, searchParams } from '../types'
import { Pagination } from '@mantine/core'
import { useEffect, useState } from 'react'
import { fetchResults } from '../api'
import ResultCard from './resultCard'
interface ResultListProps {
  searchParams: searchParams
  onPageChange: (page: number) => void
}

export default function ResultList({
  searchParams,
  onPageChange,
}: ResultListProps) {
  const [results, setResults] = useState<result[]>([])
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    // 每次都会重新建立
    let cancelled = false
    const controller = new AbortController()
    const signal = controller.signal
    async function run() {
      try {
        const data = await fetchResults(searchParams, signal)
        if (!cancelled) {
          setResults(data.content)
          setTotalPages(data.totalPage)
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return
        }
        console.error(err)
      }
    }
    run()

    // 下一次依赖变化、React 重新运行这个 effect 之前，会先执行上一次 effect 返回的 cleanup 函数；
    // 这个 cleanup 闭包访问/修改的是上一次那个 cancelled 变量。
    return () => {
      cancelled = true
      // 下一次把上一次的中断
      controller.abort()
    }
  }, [searchParams])
  return (
    <div className="flex flex-col gap-2 w-200">
      {results.map((item) => (
        <ResultCard key={item.id} {...item} />
      ))}
      {totalPages > 1 && (
        <Pagination
          className="mt-4"
          size="sm"
          value={searchParams.page}
          total={totalPages}
          onChange={onPageChange}
        />
      )}
    </div>
  )
}

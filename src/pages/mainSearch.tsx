import Bars from '../features/mainSearch/components/bars'
import Filter from '../features/mainSearch/components/filter'
import ResultList from '../features/mainSearch/components/resultList'
import type { searchParams } from '../features/mainSearch/types'
import { useState } from 'react'
export default function MainSearch() {
  const [searchParams, setSearchParams] = useState<searchParams>({
    query: '',
    page: 1,
    pageSize: 10,
    country: [],
    source: [],
  })
  return (
    <div className="flex flex-col gap-4">
      <Bars />
      <Filter onChange={setSearchParams} />
      <ResultList
        searchParams={searchParams}
        onPageChange={(page) => setSearchParams((prev) => ({ ...prev, page }))}
      />
    </div>
  )
}

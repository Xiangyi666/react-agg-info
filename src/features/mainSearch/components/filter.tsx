import { useState } from 'react'
import type { ReactNode } from 'react'
import SimpleSelect from '../../../components/simple-select'
import { Input } from '../../../components/ui/input'
import { countries, CountryCode } from '../../../components/countries'
import { MultiSelect } from '@mantine/core'
import { Button } from '../../../components/ui/button'
import type { searchParams } from '../types'
interface FilterProps {
  onChange: (params: searchParams) => void
}

function FilterField({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <h2 className="text-ink mb-2 font-bold">{label}</h2>
      {children}
    </div>
  )
}
export default function Filter({ onChange }: FilterProps) {
  const countryOptions = countries.map((ct) => ({
    value: ct.code,
    label: ct.name,
  }))
  const sizeOptions = [10, 20, 30, 50, 100] as const
  const [selectedCountry, setSelectedCountry] = useState<CountryCode[]>([])
  const [selectedKeyword, setSelectedKeyword] = useState<string>('')
  const [selectedPageSize, setSelectedPageSize] = useState<number>(10)
  return (
    <div>
      <div className="flex flex-row items-end gap-2">
        <FilterField label="country">
          <MultiSelect
            placeholder="Pick values"
            data={countryOptions}
            value={selectedCountry}
            onChange={setSelectedCountry}
            styles={{ pillsList: { flexWrap: 'nowrap' } }}
          />
        </FilterField>
        <FilterField label="keyword">
          <Input
            className="w-80"
            value={selectedKeyword}
            onChange={(e) => setSelectedKeyword(e.target.value)}
          />
        </FilterField>
        <FilterField label="page size">
          <SimpleSelect
            items={sizeOptions}
            value={selectedPageSize}
            onChange={setSelectedPageSize}
            label="pageSize"
            className="w-30"
          />
        </FilterField>
        <div>
          <Button
            className="bg-brand text-[#ffff]"
            onClick={() =>
              onChange({
                query: selectedKeyword,
                page: 1,
                pageSize: selectedPageSize,
                country: selectedCountry,
                source: [],
              })
            }
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  )
}

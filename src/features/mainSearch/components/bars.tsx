import { useState } from 'react'
import clsx from 'clsx'

export default function Bars() {
  const barOptions = [
    'Job seek',
    'Reddit',
    'My apply',
    'My favor',
    'Resume prepare',
  ] as const
  type barOptions = (typeof barOptions)[number]
  const [selectedOption, setSelectedOption] = useState<barOptions | null>(null)
  return (
    <div className="flex flex-row items-center gap-2">
      {barOptions.map((option) => (
        <div
          onClick={() => setSelectedOption(option)}
          className={clsx(
            'text-brand rounded-md bg-gray-100 px-4 py-2',
            'hover:bg-brand hover:text-white',
            selectedOption === option && '!bg-brand text-white'
          )}
          key={option}
        >
          {option}
        </div>
      ))}
    </div>
  )
}

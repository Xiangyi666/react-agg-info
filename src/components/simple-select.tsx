import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SimpleSelectProps<T extends string | number> {
  items: readonly { value: T; label: string }[] | readonly T[]
  value: T
  onChange: (value: T) => void
  placeholder?: string
  label?: string
  className?: string
}

export default function SimpleSelect<T extends string | number>({
  items,
  value,
  onChange,
  placeholder = '请选择',
  label,
  className,
}: SimpleSelectProps<T>) {
  // 标准化 items：基础类型数组转对象数组
  const normalizedItems = items.map((item) =>
    typeof item === 'object' ? item : { value: item, label: String(item) }
  )
  // Radix Select 只接受 string，需要转换
  const stringValue = String(value)
  const handleValueChange = (newValue: string) => {
    // 找回原始类型：如果是数字就转回数字
    const originalValue = normalizedItems.find(
      (item) => String(item.value) === newValue
    )?.value
    if (originalValue !== undefined) {
      onChange(originalValue)
    }
  }

  return (
    <Select value={stringValue} onValueChange={handleValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {label && <SelectLabel>{label}</SelectLabel>}
          {normalizedItems.map((item) => (
            <SelectItem key={String(item.value)} value={String(item.value)}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

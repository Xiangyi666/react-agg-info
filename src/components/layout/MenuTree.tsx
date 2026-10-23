import { useNavigate } from 'react-router-dom'
import {useState} from 'react'
export interface MenuItem {
    id: string
    name: string
    route?: string
    children?: MenuItem[]
}

type MenuTreeProps = {
    items: MenuItem[]
    nested?: boolean
}

export default function MenuTree({ items, nested = false }: MenuTreeProps) {
    

    const containerClass = nested
        ? 'w-full pl-2'
        : 'w-48 shrink-0 self-stretch bg-nav-50 text-nav-500 rounded mr-4'

    const itemClass = `px-4 py-2 text-lg cursor-pointer hover:bg-nav-200 ${!nested ? 'border-b border-nav-200' : ''}`

    return (
        <div className={containerClass}>
            {items.map((item) => (
                <MenuItemNode
                    key={item.id}
                    item={item}
                    itemClass={itemClass}
                />
            ))}
        </div>
    )
}

/** 单个菜单节点：叶子直接渲染，有子项则拆分为行 + 递归子菜单。 */
function MenuItemNode({
    item,
    itemClass,
}: {
    item: MenuItem
    itemClass: string
}) {
    const [expanded, setExpanded] = useState(false)
    const navigate = useNavigate()

    const handleClick = () => {
        if (item.children) {
            setExpanded((prev) => !prev)
            return
        }
        if (item.route) navigate(item.route)
    }
    if (!item.children) {
        return (
            <div className={itemClass} onClick={handleClick}>
                {item.name}
            </div>
        )
    }

    return (
        <>
            <div className={itemClass} onClick={handleClick}>
                {item.name}
            </div>
            <div
                className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
            >
                <div className="min-h-0  overflow-hidden ">
                    <MenuTree items={item.children} nested />
                </div>
            </div>
        </>
    )
}

import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { Navigate } from 'react-router-dom'
import route from './route'

vi.mock('@/layout/index', () => ({ default: () => null }))
vi.mock('@pages/month/index', () => ({ default: () => null }))

type RouteRecord = {
  path?: string
  index?: boolean
  element?: ReactElement
  children?: RouteRecord[]
}

const routes = route as unknown as RouteRecord[]

describe('路由配置', () => {
  it('根路径只包含 month 子路由', () => {
    const childPaths = (routes[0].children ?? []).map((c) => c.path)
    expect(childPaths).toContain('month')
    expect(childPaths).not.toContain('year')
    expect(childPaths).not.toContain('new')
  })

  it('根路径 index 重定向到 /month', () => {
    const children = routes[0].children ?? []
    const indexRoute = children.find((c) => c.index)
    expect(indexRoute).toBeDefined()

    const element = indexRoute!.element as ReactElement<{
      to?: string
      replace?: boolean
    }>
    expect(element.type).toBe(Navigate)
    expect(element.props.to).toBe('/month')
    expect(element.props.replace).toBe(true)
  })

  it('只有一个顶级路由（根路由）', () => {
    expect(routes).toHaveLength(1)
  })
})

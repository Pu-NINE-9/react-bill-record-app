import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import Layout from './index'

vi.mock('antd-mobile', async () => {
  const React = await import('react')

  const TabBar = (props: { children?: React.ReactNode; onChange?: (key: string) => void }) => {
    const items = React.Children.toArray(props.children ?? [])
    return React.createElement(
      'div',
      { 'data-testid': 'tab-bar' },
      items.map((child) => {
        const el = child as React.ReactElement<{ title?: React.ReactNode }>
        const rawKey = String(el.key ?? '')
        const itemKey = rawKey.startsWith('.$') ? rawKey.slice(2) : rawKey
        return React.createElement(
          'button',
          {
            key: itemKey,
            type: 'button',
            'data-testid': `tab-${itemKey}`,
            onClick: () => props.onChange?.(itemKey)
          },
          el.props.title
        )
      })
    )
  }
  TabBar.Item = ({ title }: { title?: React.ReactNode }) => React.createElement('span', null, title)

  return {
    TabBar,
    PullToRefresh: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'pull-to-refresh' }, children)
  }
})

vi.mock('antd-mobile/es/utils/sleep', () => ({
  sleep: () => Promise.resolve()
}))

function renderLayout(initialPath = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Layout />,
        children: [
          { index: true, element: <div>index-content</div> },
          { path: 'month', element: <div>month-content</div> },
          { path: 'year', element: <div>year-content</div> }
        ]
      }
    ],
    { initialEntries: [initialPath] }
  )
  return render(<RouterProvider router={router} />)
}

describe('Layout 布局', () => {
  it('渲染底部导航栏标题', () => {
    renderLayout()

    expect(screen.getByText('月度账单')).toBeInTheDocument()
    expect(screen.getByText('记账')).toBeInTheDocument()
    expect(screen.getByText('年度账单')).toBeInTheDocument()
  })

  it('渲染子路由出口内容', () => {
    renderLayout()

    expect(screen.getByText('index-content')).toBeInTheDocument()
  })

  it('点击底部导航项切换路由', async () => {
    renderLayout()

    fireEvent.click(screen.getByTestId('tab-/month'))

    await waitFor(() => expect(screen.getByText('month-content')).toBeInTheDocument())
  })
})

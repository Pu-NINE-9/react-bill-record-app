import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import New from './index'

describe('New 页面', () => {
  it('渲染占位内容', () => {
    render(<New />)
    expect(screen.getByText('我是New')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Year from './index'

describe('Year 页面', () => {
  it('渲染占位内容', () => {
    render(<Year />)
    expect(screen.getByText('我是Year')).toBeInTheDocument()
  })
})

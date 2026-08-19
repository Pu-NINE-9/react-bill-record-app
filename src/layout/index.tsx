// TODO: 导入二级路由出口
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      {/* 二级路由出口 */}
      <Outlet />
      <div>我是layout</div>
    </>
  )
}

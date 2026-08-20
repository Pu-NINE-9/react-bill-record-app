// TODO: 导入二级路由出口
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useSystemStore } from '@/stores'
import { PullToRefresh, TabBar } from 'antd-mobile'
import { sleep } from 'antd-mobile/es/utils/sleep'
import type { TabBarItem } from '@/types'

export default function Layout() {
  // // TODO: 导出仓库内容
  const tabBarList = useSystemStore((s) => s.tabBarList)
  const triggerRefresh = useSystemStore((s) => s.triggerRefresh)

  const navigate = useNavigate() // 返回跳转函数
  /**
   * TODO: location对象结构：
   * {
   *   pathname: "/year", // 当前路由路径就是地址栏域名后面的部分
   *   search: "", // url查询参数 ?a=1
   *   hash: "",
   *   state: null
   * }
   */
  const location = useLocation() //拿到当前浏览器地址栏的信息

  return (
    <PullToRefresh
      onRefresh={async () => {
        triggerRefresh()
        await sleep(1000)
      }}
    >
      <div className="h-screen flex flex-col">
        {/* 主内容区域，占满剩余高度，内容可滚动 */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>

        {/* 底部TabBar，绑定路由 */}
        <div className="tab-bar">
          <TabBar
            activeKey={location.pathname}
            onChange={(key) => navigate(key)} // key就是我们配置的路由path，例如/month
          >
            {tabBarList.map((item: TabBarItem) => {
              const Icon = item.icon
              return <TabBar.Item key={item.key} icon={<Icon />} title={item.title} />
            })}
          </TabBar>
        </div>
      </div>
    </PullToRefresh>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/assets/styles/index.css'
import '@/assets/styles/theme.css'
import { RouterProvider } from 'react-router-dom'
import router from '@/router/index.tsx'
import { ConfigProvider } from 'antd-mobile'
import enUS from 'antd-mobile/es/locales/en-US'
import '@/i18n/index' // 导入i18n相关配置

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* antd-mobile语言包设置 */}
    <ConfigProvider locale={enUS}>
      <RouterProvider router={router} />
    </ConfigProvider>
  </StrictMode>
)

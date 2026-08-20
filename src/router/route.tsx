import Layout from '@/layout/index'
import Month from '@pages/month/index'
import { Navigate } from 'react-router-dom'

export default [
  {
    path: '/',
    element: <Layout />,
    children: [
      // 重定向
      {
        index: true,
        element: <Navigate to="/month" replace />
      },
      {
        path: 'month',
        element: <Month />
      }
    ]
  }
]

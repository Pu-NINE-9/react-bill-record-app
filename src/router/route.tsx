import Layout from '@/layout/index'
import New from '@pages/new/index'
import Year from '@pages/year/index'
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
        path: 'year',
        element: <Year />
      },
      {
        path: 'month',
        element: <Month />
      }
    ]
  },
  {
    path: 'new',
    element: <New />
  }
]

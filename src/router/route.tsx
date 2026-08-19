import Layout from '@/layout/index'
import New from '@pages/new/index'
import Year from '@pages/year/index'

export default [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/year',
        element: <Year />
      }
    ]
  },
  {
    path: '/new',
    element: <New />
  }
]

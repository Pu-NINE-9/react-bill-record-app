import { useRequest } from '@hooks'

function App() {
  const { res, loading, error } = useRequest('/user', 'get')
  if (loading) return <div>加载中...</div>
  if (error) return <div>错误：{error.message}</div>
  return <div>{JSON.stringify(res)}</div>

  // return (
  //   <>
  //     <div className="text-blue-500 text-3xl">12123</div>
  //   </>
  // )
}

export default App

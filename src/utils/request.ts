// TODO: Axios 实力配置
import axios, { type AxiosResponse, type AxiosRequestConfig } from 'axios'
import axiosRetry from 'axios-retry' // TODO: 引入错误重试

// TODO: 创建实例
const instance = axios.create({
  // TODO.1 基地址、超时时间
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 10000
})

// TODO: 错误后重试（利用第三方库axios-retry）
axiosRetry(instance, {
  retries: 3, // 最大重试次数
  retryDelay: (retryCount) => {
    console.log('网络错误，正在重试...')
    return retryCount * 1000 // 重试延迟，1s到3秒
  },
  // TODO: 只有网络错误或5xx服务端错误才重试
  retryCondition: (error) =>
    axiosRetry.isNetworkOrIdempotentRequestError(error) || (error.response?.status ?? 0) >= 500
})

// TODO: 添加请求拦截器
instance.interceptors.request.use(
  function (config) {
    // config 是请求配置对象
    return config
  },
  (err) => Promise.reject(err)
)

// TODO: 添加响应拦截器
instance.interceptors.response.use(
  function (response) {
    const { data } = response
    if (data.code === 200) return data.data
    return Promise.reject(data)
  },
  function (error) {
    if (axios.isCancel(error)) {
      console.log('请求取消', error.message)
      return Promise.reject(error)
    }
    return Promise.reject(error)
  }
)

export default instance

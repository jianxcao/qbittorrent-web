import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import axios from 'axios'

// qBittorrent API 配置
let domain = ''
// qBittorrent >= 5.2 API Key，无 cookie 鉴权
let apiKey = ''

export const setDomain = (d: string) => {
  if (!d) {
    return
  }
  domain = d
  httpClient.defaults.baseURL = getBaseURL()
}

export const setApiKey = (key: string) => {
  apiKey = key.trim()
}

const getBaseURL = () => {
  if (domain.endsWith('/')) {
    domain = domain.slice(0, -1)
  }
  if (!domain.endsWith('/api/v2')) {
    return `${domain}/api/v2`
  }
  return domain
}

// 创建 Axios 实例
export const httpClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 600000,
  withCredentials: true
})

// 请求拦截器
httpClient.interceptors.request.use((config) => {
  if (apiKey) {
    config.headers.set('Authorization', `Bearer ${apiKey}`)
  } else {
    config.headers.delete('Authorization')
  }
  return config
})

// 响应拦截器
httpClient.interceptors.response.use(
  (res) => {
    return res
  },
  async (error) => {
    const { response, config } = error
    const requestUrl = config?.url || ''
    const onLoginPage = window.router.currentRoute.value.path === '/login'
    // 登录接口失败和登录页上的探测请求不跳转，避免打断表单错误提示
    if ((response?.status === 401 || response?.status === 403) && !requestUrl.includes('/auth/login') && !onLoginPage) {
      console.error(response.status, response, window.router.currentRoute.value.path)
      window.router.push('/login')
    }
    return Promise.reject(error)
  }
)

// API 结果类型
export interface ApiResult<T = any> {
  data?: T
  success: boolean
  error?: string
}

// 辅助函数：将对象转换为 URLSearchParams
export function toFormData(obj: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      params.append(key, String(value))
    }
  }
  return params
}

// 辅助函数：将对象转换为 application/x-www-form-urlencoded 格式
export function toUrlEncoded(obj: Record<string, any>): string {
  return toFormData(obj).toString()
}

// 辅助函数：将哈希数组转换为 qBittorrent 的 hashes 参数格式
export function hashesToParam(hashes: string | string[]): string {
  if (Array.isArray(hashes)) {
    return hashes.join('|')
  }
  return hashes
}

// 辅助函数：GET 请求
export async function get<T = any>(url: string, params?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
  const res = await httpClient.get<T>(url, { params, ...config })
  return res.data
}

// 辅助函数：POST 请求 (application/x-www-form-urlencoded)
export async function post<T = any>(
  url: string,
  data?: Record<string, any> | URLSearchParams | string,
  config?: AxiosRequestConfig
): Promise<T> {
  let postData: any = data
  let headers = config?.headers || {}

  if (data && typeof data === 'object' && !(data instanceof URLSearchParams)) {
    postData = toFormData(data)
    headers = { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }
  } else if (typeof data === 'string') {
    headers = { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' }
  }

  const res = await httpClient.post<T>(url, postData, {
    ...config,
    headers
  })
  return res.data
}

// 辅助函数：POST 请求 (multipart/form-data)
export async function postMultipart<T = any>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
  const res = await httpClient.post<T>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'multipart/form-data'
    }
  })
  return res.data
}

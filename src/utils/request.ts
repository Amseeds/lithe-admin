import axios, { type AxiosRequestConfig } from 'axios'
import { useMessage } from 'naive-ui'

import { requestEventBus } from '@/event-bus'

const message = useMessage()

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SITE_BASE_API || '/api',
  timeout: 10_000,
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    config.headers.Authorization = localStorage.getItem('token') || ''
    requestEventBus.emit({ type: 'request' })
    return config
  },
  (error) => {
    requestEventBus.emit({ type: 'requestError', error })
    return Promise.reject(error)
  },
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => {
    requestEventBus.emit({ type: 'response', data: response.data })
    return response
  },
  (error) => {
    const code = error.response?.data?.code
    requestEventBus.emit({ type: 'responseError', error, code })

    // 401 未授权处理
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      message.error('登录已过期，请重新登录')
      // 可以在这里添加跳转登录页逻辑
    }

    return Promise.reject(error)
  },
)

export interface ResponseBody<T = unknown> {
  code: number
  data: T
  message: string
}

/**
 * 基础请求方法
 */
export async function request<T = unknown>(config: AxiosRequestConfig) {
  const response = await axiosInstance.request<ResponseBody<T>>(config)
  return response.data
}

/**
 * 清理空参数
 */
function cleanParams(params: Record<string, unknown> | null | undefined) {
  if (!params) return {}
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    ),
  )
}

/**
 * 通用请求处理函数
 */
export const requestHandler = <T = unknown>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  dataOrParams: Record<string, unknown> | null = null,
): Promise<ResponseBody<T>> => {
  const config: AxiosRequestConfig = { url, method }

  if (method === 'GET') {
    config.params = cleanParams(dataOrParams as Record<string, unknown>)
  } else {
    config.data = dataOrParams
  }

  return request<T>(config)
}

/**
 * 文件下载
 */
export const download = async ({
  url,
  method = 'get',
  params,
  data,
  fileName,
}: {
  url: string
  method?: 'get' | 'post'
  params?: Record<string, unknown>
  data?: Record<string, unknown>
  fileName?: string
}) => {
  const res = await axiosInstance.request({
    url,
    method,
    params,
    data,
    responseType: 'blob',
  })

  const contentType = res.headers['content-type']

  // 后端返回 JSON（通常是错误）
  if (contentType?.includes('application/json')) {
    const text = await res.data.text()
    const json = JSON.parse(text)
    message.error(json.message || '下载失败')
    return
  }

  // 解析文件名
  let finalFileName = fileName || '下载文件'
  const disposition = res.headers['content-disposition']

  if (disposition) {
    let match = disposition.match(/filename\*=UTF-8''(.+)/)
    if (match && match[1]) {
      finalFileName = decodeURIComponent(match[1])
    } else {
      match = disposition.match(/filename=([^;]+)/)
      if (match && match[1]) {
        finalFileName = decodeURIComponent(match[1].replace(/"/g, ''))
      }
    }
  }

  // 创建 blob 下载
  const blob = new Blob([res.data])
  const downloadUrl = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = downloadUrl
  a.download = finalFileName
  document.body.appendChild(a)
  a.click()

  document.body.removeChild(a)
  window.URL.revokeObjectURL(downloadUrl)
}

/**
 * GET 请求
 */
export const get = <T = unknown>(url: string, params?: Record<string, unknown>) =>
  requestHandler<T>(url, 'GET', params || null)

/**
 * POST 请求
 */
export const post = <T = unknown>(url: string, data?: Record<string, unknown>) =>
  requestHandler<T>(url, 'POST', data || null)

/**
 * PUT 请求
 */
export const put = <T = unknown>(url: string, data?: Record<string, unknown>) =>
  requestHandler<T>(url, 'PUT', data || null)

/**
 * DELETE 请求
 */
export const del = <T = unknown>(url: string, data?: Record<string, unknown>) =>
  requestHandler<T>(url, 'DELETE', data || null)

export default request

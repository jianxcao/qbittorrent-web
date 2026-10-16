/**
 * 认证模块
 * Authentication API
 */

import { isString } from 'lodash-es'
import { post } from '../http'

/**
 * 登录
 * POST /auth/login
 * @param username 用户名
 * @param password 密码
 * @returns 登录是否成功
 * @description
 * HTTP 状态码与响应体：
 * - qB < 5.2: HTTP 200，成功返回 "Ok."，认证失败返回 "Fails."
 * - qB >= 5.2: HTTP 204 No Content（空 body）表示成功，失败时返回 HTTP 401 Unauthorized（或特定错误码）
 * - 403: 用户 IP 因多次失败尝试被封禁
 *
 * 注意：需要设置 Referer 或 Origin header 为与请求 Host 相同的域名和端口
 */
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const res = await post('/auth/login', { username, password })
    // qB < 5.2 成功返回 'Ok.'；qB >= 5.2 成功返回 204 No Content（axios 解析 res 为 '' 或 undefined）
    if (res === '' || res === undefined || res === null) {
      return true
    }
    if (isString(res)) {
      const text = res.trim().toLowerCase()
      if (text.includes('ok')) {
        return true
      }
      if (text.includes('fail')) {
        return false
      }
    }
    return false
  } catch (error) {
    console.error('Login failed:', error)
    return false
  }
}

/**
 * 登出
 * POST /auth/logout
 */
export async function logout(): Promise<boolean> {
  try {
    await post('/auth/logout')
    return true
  } catch (error) {
    console.error('Logout failed:', error)
    return false
  }
}

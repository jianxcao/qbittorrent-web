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
 * HTTP 状态码：
 * - 200: 登录成功或认证失败
 * - 403: 用户 IP 因多次失败尝试被封禁
 *
 * 注意：需要设置 Referer 或 Origin header 为与请求 Host 相同的域名和端口
 */
export async function login(username: string, password: string): Promise<boolean> {
  try {
    const res = await post('/auth/login', { username, password })
    if (isString(res) && (res as string).trim().toLowerCase().includes('ok')) {
      return true
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

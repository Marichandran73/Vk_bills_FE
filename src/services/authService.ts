import apiService from './apiService'

export type LoginPayload = {
  username: string
  password: string
}

export const sendLogin = async (payload: LoginPayload) => {
  return apiService.post('/login', payload)
  }

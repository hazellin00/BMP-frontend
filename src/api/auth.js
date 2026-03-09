import client from './client.js'

export function login(email, password) {
  return client.post('api/v1/auth/login', { email, password })
}

export function register(name, email, password) {
  return client.post('api/v1/auth/register', { name, email, password })
}

export function getMe() {
  return client.get('api/v1/me')
}

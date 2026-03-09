import client from './client.js'

export function getProfile() {
  return client.get('api/v1/me')
}

export function updateProfile(data) {
  return client.put('api/v1/me', data)
}

import client from './client.js'

export function getProfile() {
  return client.get('api/v1/me')
}

export function updateProfile(data) {
  return client.patch('api/v1/me', data)
}

import client from './client.js'

export function getProfile() {
  return client.get('/users/me')
}

export function updateProfile(data) {
  return client.put('/users/me', data)
}

import client from './client.js'

export function getSharingCode() {
  return client.get('/sharing/code')
}

export function resetSharingCode() {
  return client.post('/sharing/code/reset')
}

export function getViewers() {
  return client.get('/sharing/viewers')
}

export function revokeViewer(viewerId) {
  return client.delete(`/sharing/viewers/${viewerId}`)
}

import client from './client.js'

export function recordBP(sys, dia, pulse) {
  return client.post('/blood-pressure/', {
    systolic: sys,
    diastolic: dia,
    pulse: pulse,
  })
}

export function getHistory(startDate, endDate) {
  return client.get('/blood-pressure/', {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
}

export function getTodayRecord() {
  return client.get('/blood-pressure/today')
}

import client from './client.js'

export function recordBP(sys, dia, pulse) {
  return client.post('api/v1/blood-pressure/', {
    systolic: sys,
    diastolic: dia,
    pulse: pulse,
  })
}

export function getHistory(startDate, endDate) {
  return client.get('api/v1/blood-pressure/', {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
}

export function getTodayRecord() {
  return client.get('api/v1/blood-pressure/today')
}

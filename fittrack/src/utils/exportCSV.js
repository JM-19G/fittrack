export function exportLogsAsCSV(logs, username) {
  if (!logs || logs.length === 0) return false

  const headers = [
    'Date',
    'Exercise Type',
    'Duration (min)',
    'Calories (kcal)',
    'Distance (km)',
    'Pace (min/km)',
    'Sets',
    'Reps',
    'Notes',
  ]

  const rows = logs
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(log => [
      log.date,
      log.type,
      log.duration || '',
      log.calories || '',
      log.distance || '',
      log.pace || '',
      log.sets || '',
      log.reps || '',
      log.notes ? `"${log.notes.replace(/"/g, '""')}"` : '',
    ])

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const fileName = `fittrack_${username.replace(/\s+g/, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`

  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return true
}
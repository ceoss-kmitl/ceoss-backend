/**
 * slot1 - slot 52
 * 08:00 - 20:00
 * each slot = 15 mins
 * @param time ex. 08:30, 12:15
 */
export function mapTimeToTimeSlot(time: string) {
  const [hr, min] = time.split(':').map((each) => Number(each))
  const START_HOURS = 8
  const totalMinute = (hr - START_HOURS) * 60 + min
  const slot = Math.floor(totalMinute / 15) + 1
  return slot
}

/**
 * slot1 - slot 52
 * 08:00 - 20:00
 * each slot = 15 mins
 * @param timeSlot ex. 1, 6
 */
export function mapTimeSlotToTime(timeSlot: number, seperator = ':') {
  const START_HOURS = 8
  let minutes = (timeSlot - 1) * 15
  let hours = 0
  while (minutes >= 60) {
    hours += 1
    minutes -= 60
  }
  const hr = `${String(hours + START_HOURS).padStart(2, '0')}`
  const min = `${String(minutes).padStart(2, '0')}`
  return `${hr}${seperator}${min}`
}

export function mapDateToThaiDate(dateOrDateString: Date | string) {
  if (typeof dateOrDateString === 'string') {
    return new Date(dateOrDateString).toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } else {
    return dateOrDateString.toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }
}

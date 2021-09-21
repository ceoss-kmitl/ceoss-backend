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
 * @param timeSlot ex. 1, 12
 */
export function mapTimeSlotToTime(timeSlot: number) {
  const START_HOURS = 8
  let min = (timeSlot - 1) * 15
  let hr = START_HOURS
  while (min >= 60) {
    min -= 60
    hr++
  }
  const hrString = String(hr).padStart(2, '0')
  const minString = String(min).padStart(2, '0')
  return `${hrString}:${minString}`
}

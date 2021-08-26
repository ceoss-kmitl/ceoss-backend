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

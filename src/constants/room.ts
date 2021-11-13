interface IRoomTeacherPair {
  roomName: string
  teacherNameList: string[]
}

/**
 * Pair teachers with the room
 */
export const ROOM_TEACHER_PAIR: IRoomTeacherPair[] = [
  {
    roomName: '810',
    teacherNameList: ['คณัฐ ตังติสานนท์'],
  },
  {
    roomName: '811',
    teacherNameList: ['จิระศักดิ์ สิทธิกร'],
  },
]

/**
 * Subject code that doesn't need room
 * - PRE-ACTIVITIES FOR  ENGINEERS
 * - PRE-ACTIVITIES FOR ENGINEERS
 * - PRE-ENGINEERING ACTIVITIES
 * - PROJECT 1
 * - PROJECT 2
 * - PROJECT 2
 */
export const SUBJECT_NO_ROOM: string[] = [
  '01006028',
  '90642036',
  '01006027',
  '01076311',
  '01076312',
  '01236072',
]

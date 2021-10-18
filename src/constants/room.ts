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
 */
export const SUBJECT_NO_ROOM: string[] = ['01076312']

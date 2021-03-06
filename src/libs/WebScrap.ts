import Fetch from 'node-fetch'
import Iconv from 'iconv-lite'
import Cheerio, { CheerioAPI } from 'cheerio'
import { DayOfWeek, WorkloadType } from '@constants/common'

export class WebScrap {
  private url: string
  private html: string
  private $: CheerioAPI

  constructor(url: string) {
    this.url = url
  }

  async init() {
    const buffer = await Fetch(this.url).then((res) => res.buffer())
    this.html = Iconv.decode(buffer, 'TIS-620')
    this.$ = Cheerio.load(this.html)
  }

  extractData() {
    const $ = this.$
    const tableList = $('table.hoverTable')
    const result: IWebScrapData[] = tableList.toArray().map((table, index) => {
      const subjectList: any[] = []
      let subject = {} as any

      $(table)
        .find('a[title="ดูรายละเอียดวิชานี้"]')
        .closest('tr')
        .toArray()
        .forEach((row) => {
          const columnList = $(row).find('td').toArray()
          const subjectCode = $(columnList[0]).text().trim()

          // Found new subject. Push prev subject to subjectList
          // then reset the subject to the new one
          if (subjectCode !== '' && subject.subjectCode !== subjectCode) {
            if (subject.subjectCode) subjectList.push(subject)

            subject = {
              subjectCode,
              subjectName: $(columnList[2]).text().trim(),
              ...this.extractCredit($(columnList[4]).text().trim()),
              sectionList: [],
            }
          }

          // Add section into subject
          subject.sectionList.push({
            section: Number($(columnList[6]).text().trim()),
            room: $(columnList[12]).text().trim(),
            teacherList: this.extractTeacherInfo(
              $(columnList[16]).text().trim()
            ),
            // Split for removing แสดงวันวัน-เวลาเรียนทั้งหมด
            time: $(columnList[10]).text().trim().split('\n')[0],
            ...this.extractTimeAndType(
              $(columnList[10]).text().trim().split('\n')[0]
            ),
          })
        })

      return {
        classYear: index + 1,
        subjectList,
      }
    })

    return result
  }

  // Utilities function
  private extractCredit(creditStr: string) {
    const [credit, lectureHours, labHours, independentHours] = creditStr
      .replace(/[\(\)]/g, '-')
      .split('-')
      .map((each) => Number(each))

    return {
      credit,
      lectureHours,
      labHours,
      independentHours,
    }
  }

  private extractTimeAndType(timeStr: string) {
    const [day] = timeStr.match(/[^\s]+\./) ?? [null]
    const [type] = timeStr.match(/\(.{1}\)/) ?? [null]
    const rawTimeList = timeStr.match(/\d{2}:\d{2}/g) ?? [null]
    const timeList: { startTime: string; endTime: string }[] = []

    let index = 0
    for (const time of rawTimeList) {
      if (!timeList[index]) timeList[index] = {} as any

      if (!timeList[index].startTime) {
        timeList[index].startTime = time ?? 'err'
        continue
      }
      timeList[index].endTime = time ?? 'err'
      index++
    }

    return {
      dayOfWeek: this.mapDayToDayOfWeek(day),
      timeList,
      timeSlotList: timeList.map(({ startTime, endTime }) => ({
        startSlot: this.mapTimeToTimeSlot(startTime),
        endSlot: this.mapTimeToTimeSlot(endTime) - 1,
      })),
      subjectType: this.mapTypeToWorkloadType(type),
    }
  }

  private mapDayToDayOfWeek(day: string | null) {
    if (!day) return DayOfWeek.MONDAY
    const Day = {
      จ: DayOfWeek.MONDAY,
      อ: DayOfWeek.TUESDAY,
      พ: DayOfWeek.WEDNESDAY,
      พฤ: DayOfWeek.THURSDAY,
      ศ: DayOfWeek.FRIDAY,
      ส: DayOfWeek.SATURDAY,
      อา: DayOfWeek.SUNDAY,
    } as any
    return Day[day.replace('.', '')]
  }

  private mapTimeToTimeSlot(time: string | null) {
    if (!time) return -1
    const [hr, min] = time.split(':').map((each) => Number(each))
    const START_HOURS = 8
    const totalMinute = (hr - START_HOURS) * 60 + min
    const slot = Math.floor(totalMinute / 15) + 1
    return slot
  }

  private mapTypeToWorkloadType(type: string | null) {
    if (!type) return WorkloadType.LECTURE
    const typeStr = type.replace(/[\(\)]/g, '')
    const Workload = {
      ท: WorkloadType.LECTURE,
      ป: WorkloadType.LAB,
    } as any
    return Workload[typeStr]
  }

  private extractTeacherInfo(teacherStr: string) {
    const teacherList = teacherStr
      .split(', ')
      .map((teacher) => {
        const [title] = teacher.match(/[^\s]+\./) ?? ['']
        const [name] = teacher.match(/[^.,]+\s+[^.,]+/) ?? ['']
        const fullName = name.split(/\s+/).join(' ')
        return { title, name: fullName }
      })
      .filter((teacher) => teacher.name)
    return teacherList
  }
}

interface IWebScrapData {
  classYear: number
  subjectList: {
    subjectCode: string
    subjectName: string
    credit: number
    lectureHours: number
    labHours: number
    independentHours: number
    sectionList: {
      section: number
      room: string
      teacherList: {
        title: string
        name: string
      }[]
      time: string
      dayOfWeek: DayOfWeek
      timeList: { startTime: string; endTime: string }[]
      timeSlotList: { startSlot: number; endSlot: number }[]
      subjectType: WorkloadType
    }[]
  }[]
}

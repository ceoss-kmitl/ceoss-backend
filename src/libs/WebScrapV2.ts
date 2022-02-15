import Puppeteer from 'puppeteer'
import Cheerio, { CheerioAPI } from 'cheerio'

import { get, last } from 'lodash'
import { DayOfWeek, WorkloadType } from '@constants/common'
import { Time } from '@models/time'

enum TableHeader {
  'รหัสวิชา' = 0,
  'ชื่อวิชา',
  'หน่วยกิต',
  'กลุ่ม',
  'วันเรียน',
  'ห้อง',
  'ตึก',
  'ผู้สอน',
  'วันสอบ',
}

const SectionType = {
  ทฤษฎี: WorkloadType.LECTURE,
  ปฏิบัติ: WorkloadType.LAB,
}

const DayOfWeekName = {
  'จ.': DayOfWeek.MONDAY,
  'อ.': DayOfWeek.TUESDAY,
  'พ.': DayOfWeek.WEDNESDAY,
  'พฤ.': DayOfWeek.THURSDAY,
  'ศ.': DayOfWeek.FRIDAY,
  'ส.': DayOfWeek.SATURDAY,
  'อา.': DayOfWeek.SUNDAY,
}

export class WebScrapV2 {
  private url: string
  private html: string
  private $: CheerioAPI

  constructor(academicYear: number, semester: number) {
    this.url = `https://new.reg.kmitl.ac.th/reg/#/teach_table?mode=by_class&selected_year=${academicYear}&selected_semester=${semester}&selected_faculty=01&selected_department=05&selected_curriculum=06&selected_class_year&search_all_faculty=false&search_all_department=false&search_all_curriculum=false&search_all_class_year=true`
  }

  async init() {
    const browser = await Puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(this.url)
    await page.waitForSelector('table', {
      timeout: 5000,
    })

    this.html = await page.evaluate(() => {
      return (document.querySelector('html') as any).outerHTML
    })
    await browser.close()
    this.$ = Cheerio.load(this.html)
  }

  extractData() {
    const $ = this.$
    const classYearTableList = $(
      'div.v-card__text.text-center div.v-card__text'
    )

    return classYearTableList
      .toArray()
      .map((_classYearTable) => {
        const classYearTitle = $(_classYearTable)
          .find('h2:nth-child(3)')
          .text()
          .trim()
        const tableList = $(_classYearTable)
          .find('table')
          .toArray()
          .map((_table) => {
            const tableTitle = $(_table)
              .closest('div:not([class])')
              .find('div.text-h7.deep-orange')
              .text()
              .trim()
            const rowList = $(_table)
              .find('tbody tr')
              .toArray()
              .map((_row) => {
                const rowData = $(_row).find('td').toArray()

                return {
                  subjectCode: $(rowData[TableHeader.รหัสวิชา]).text().trim(),
                  subjectName: $(rowData[TableHeader.ชื่อวิชา]).text().trim(),
                  credit: this.toCreditObject(
                    $(rowData[TableHeader.หน่วยกิต]).text().trim()
                  ),
                  section: this.toSectionObject(
                    $(rowData[TableHeader.กลุ่ม]).text().trim()
                  ),
                  dateTime: $(rowData[TableHeader.วันเรียน])
                    .text()
                    .trim()
                    .split('+')
                    .map((date) => this.toDateTimeObject(date.trim())),
                  room: $(rowData[TableHeader.ห้อง]).text().trim(),
                  teacher: $(rowData[TableHeader.ผู้สอน])
                    .find('div div')
                    .toArray()
                    .map((teacher) =>
                      this.toTeacherObject($(teacher).text().trim())
                    ),
                }
              })
            return {
              tableTitle,
              isRequiredSubject: tableTitle === 'วิชาบังคับ',
              rowList,
            }
          })

        return {
          classYear: parseInt(last(classYearTitle) || '0'),
          tableList,
        }
      })
      .filter((each) => each.classYear)
  }

  toCreditObject(creditString: string): ICredit {
    const creditRegex = new RegExp(/^\d\(\d\-\d\-\d\)$/)
    if (!creditRegex.test(creditString)) {
      return {
        credit: 0,
        lecHr: 0,
        labHr: 0,
        indHr: 0,
      }
    }
    return {
      credit: parseInt(creditString[0]),
      lecHr: parseInt(creditString[2]),
      labHr: parseInt(creditString[4]),
      indHr: parseInt(creditString[6]),
    }
  }

  toSectionObject(sectionString: string): ISection {
    const [section, type] = sectionString.split(/\s+/)
    return {
      section: parseInt(section) || 0,
      type:
        SectionType[type as keyof typeof SectionType] || WorkloadType.LECTURE,
    }
  }

  toDateTimeObject(dateTimeString: string): IDateTime {
    const [dayOfWeek, time] = dateTimeString.split(/\s+/)
    if (!time) {
      return {
        dayOfWeek: DayOfWeek.SUNDAY,
        startSlot: 0,
        endSlot: 0,
      }
    }
    const [startTime, endTime] = time.split('-')

    return {
      dayOfWeek: DayOfWeekName[dayOfWeek as keyof typeof DayOfWeekName],
      startSlot: Time.fromTimeString(startTime),
      endSlot: Time.fromTimeString(endTime) - 1,
    }
  }

  toTeacherObject(teacherString: string): ITeacher {
    const titleRegex = new RegExp(/(.+)\./)
    const title = get(teacherString.match(titleRegex), 0, '')
    const name = teacherString
      .replace(titleRegex, '')
      .split(/\s+/)
      .map((each) => each.trim())
      .join(' ')
    return {
      title,
      name,
    }
  }
}

interface ICredit {
  credit: number
  lecHr: number
  labHr: number
  indHr: number
}

interface ISection {
  section: number
  type: WorkloadType
}

interface IDateTime {
  dayOfWeek: DayOfWeek
  startSlot: number
  endSlot: number
}

interface ITeacher {
  title: string
  name: string
}

import Puppeteer from 'puppeteer'
import { CheerioAPI, load as CheerioLoad } from 'cheerio'
import { get, last } from 'lodash'

import { DayOfWeek, Degree, WorkloadType } from '@constants/common'
import { Time } from '@models/time'
import { Web } from '@models/web'
import { BadRequestError } from '@errors/badRequestError'

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

const CurriculumDegree = {
  'วิศวกรรมคอมพิวเตอร์': Degree.BACHELOR,
  'วิศวกรรมคอมพิวเตอร์ (ต่อเนื่อง)': Degree.BACHELOR_CONTINUE,
  'วิศวกรรมดนตรีและสื่อประสม': Degree.BACHELOR,
  'Software Engineering (International program)': Degree.BACHELOR_INTER,
  'Computer Innovation Engineering (International Program)':
    Degree.BACHELOR_INTER,
  'วิศวกรรมสารสนเทศ': Degree.BACHELOR,
  'วิศวกรรมโทรคมนาคม': Degree.BACHELOR,
  'วิศวกรรมไฟฟ้า': Degree.BACHELOR,
  'อิเล็กทรอนิกส์': Degree.BACHELOR,
  'วิศวกรรมเครื่องกล': Degree.BACHELOR,
  'วิศวกรรมการวัดและควบคุม': Degree.BACHELOR,
  'วิศวกรรมโยธา': Degree.BACHELOR,
  'วิศวกรรมเกษตร': Degree.BACHELOR,
  'วิศวกรรมเคมี': Degree.BACHELOR,
  'วิศวกรรมอาหาร': Degree.BACHELOR,
  'วิศวกรรมอุตสาหการ': Degree.BACHELOR,
}

const CurriculumField = {
  'วิศวกรรมคอมพิวเตอร์': 'D',
  'วิศวกรรมคอมพิวเตอร์ (ต่อเนื่อง)': 'DT',
  'วิศวกรรมดนตรีและสื่อประสม': 'IMSE',
  'Software Engineering (International program)': 'SE',
  'Computer Innovation Engineering (International Program)': 'CIE',
  'วิศวกรรมสารสนเทศ': 'ITE',
  'วิศวกรรมโทรคมนาคมและโครงข่าย': 'X',
  'วิศวกรรมไฟฟ้า': 'EE',
  'วิศวกรรมอิเล็กทรอนิกส์': 'X',
  'วิศวกรรมเครื่องกล': 'X',
  'วิศวกรรมขนส่งทางราง': 'X',
  'วิศวกรรมเมคคาทรอนิกส์และออโตเมชัน': 'X',
  'วิศวกรรมโยธา': 'X',
  'วิศวกรรมเกษตรอัจฉริยะ': 'X',
  'วิศวกรรมเคมี': 'X',
  'วิศวกรรมอาหาร': 'X',
  'วิศวกรรมอุตสาหการ': 'X',
}

const TIMEOUT_SEC = 30

// Example url
// https://new.reg.kmitl.ac.th/reg/#/teach_table?mode=by_class&selected_year=2564&selected_semester=2&selected_faculty=01&selected_department=05&selected_curriculum&selected_class_year&search_all_faculty=false&search_all_department=false&search_all_curriculum=true&search_all_class_year=true
// https://new.reg.kmitl.ac.th/reg/#/teach_table?mode=by_subject_id&selected_year=2564&selected_semester=2&selected_faculty=01&selected_department&selected_curriculum&selected_class_year=1&search_all_faculty=false&search_all_department=true&search_all_curriculum=true&search_all_class_year=false&selected_subject_id=01006012

type IWebScrapOptions = {
  webId: string
  academicYear: number
  semester: number
}

export class WebScrapV2 {
  private url: string
  private html: string
  private $: CheerioAPI

  public async init(options: IWebScrapOptions) {
    const { webId, academicYear, semester } = options
    await this.loadWebUrl(webId, academicYear, semester)
    await this.loadWebDocument()
  }

  private async loadWebUrl(
    webId: string,
    academicYear: number,
    semester: number
  ) {
    const web = await Web.findOne({ where: { id: webId } })
    if (!web) {
      throw new BadRequestError('ไม่สามารถดึงข้อมูลจากเว็บสำนักทะเบียนได้', [
        `Web id(${webId}) is not found`,
      ])
    }
    const urlWithoutAcademicYear = web.url
      .replace(/&selected_year=\d+/g, '')
      .replace(/selected_year=\d+/g, '')
      .replace(/&selected_semester=\d+/g, '')
      .replace(/selected_semester=\d+/g, '')

    this.url = `${urlWithoutAcademicYear}&selected_year=${academicYear}&selected_semester=${semester}`
  }

  private async loadWebDocument() {
    const browser = await Puppeteer.launch()
    const page = await browser.newPage()
    await page.goto(this.url)
    await page.waitForSelector('table', {
      timeout: TIMEOUT_SEC * 1000,
    })

    this.html = await page.evaluate(() => {
      return (document.querySelector('html') as any).outerHTML
    })
    await browser.close()
    this.$ = CheerioLoad(this.html)
  }

  public extractData() {
    const $ = this.$
    const classYearTableList = $(
      'div.v-card__text.text-center div.v-card__text'
    )

    return classYearTableList
      .toArray()
      .map((_classYearTable) => {
        const classYearTitle1 = $(_classYearTable)
          .find('h2:nth-child(2)')
          .text()
          .trim()
        const classYearTitle2 = $(_classYearTable)
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
          classYear: parseInt(last(classYearTitle2) || '0'),
          curriculum: this.toCurriculumObject(classYearTitle1, classYearTitle2),
          tableList,
        }
      })
      .filter((each) => each?.curriculum?.degree)
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

  toCurriculumObject(
    curriculumString1: string,
    curriculumString2: string
  ): ICurriculum {
    const i = curriculumString2.lastIndexOf(' ชั้นปีที่')
    const curriculum = curriculumString2.substring(0, i)

    return {
      degree:
        CurriculumDegree[curriculumString1 as keyof typeof CurriculumDegree],
      fieldOfStudy: CurriculumField[curriculum as keyof typeof CurriculumField],
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

interface ICurriculum {
  fieldOfStudy: string
  degree: Degree
}

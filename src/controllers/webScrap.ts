import {
  Get,
  JsonController,
  QueryParams,
  UseBefore,
} from 'routing-controllers'
import { IWebScrapQuery } from '@controllers/types/webScrap'
import { schema } from '@middlewares/schema'
import { WebScrap } from '@libs/WebScrap'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { Time } from '@models/time'
import { NotFoundError } from '@errors/notFoundError'

// REG example url
// http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=2563&semester=1

@JsonController()
export class WebScrapController {
  @Get('/web-scrap')
  @UseBefore(schema(IWebScrapQuery, 'query'))
  async scrapDataFromRegKMITL(@QueryParams() query: IWebScrapQuery) {
    const { academic_year, semester } = query
    const setting = await Setting.get()

    const rawUrl = setting.webScrapUrl.replace(/&year=\d+&semester=\d/g, '')
    setting.webScrapUrl = `${rawUrl}&year=${academic_year}&semester=${semester}`

    const webScrap = new WebScrap(setting.webScrapUrl)
    await webScrap.init()
    const data = webScrap.extractData()

    const subjectErrorList: string[] = []

    for (const _classYear of data) {
      for (const _subject of _classYear.subjectList) {
        for (const _section of _subject.sectionList) {
          for (const _teacher of _section.teacherList) {
            // Step 1: Find teacher in DB. If not found then skip to next teacher
            const teacher = await Teacher.findByName(_teacher.name, {
              relations: ['workloadList'],
            })
            if (!teacher) {
              continue
            }

            // Step 2: Find subject in DB. If not found then add to error list and skip
            const subject = await Subject.findOneByCode(_subject.subjectCode)
            if (!subject) {
              subjectErrorList.push(
                `(${_subject.subjectCode})${_subject.subjectName}`
              )
              continue
            }

            // Step 3: Update or create new workload with the data
            const workload =
              (await Workload.findOne({
                relations: ['subject', 'timeList', 'timeList.startSlot'],
                where: {
                  academicYear: academic_year,
                  semester,
                  subject: { id: subject.id },
                  section: _section.section,
                  dayOfWeek: _section.dayOfWeek,
                  timeList: { startSlot: _section.timeSlotList[0].startSlot },
                },
              })) || new Workload()
            workload.subject = subject
            workload.section = _section.section
            workload.type = _section.subjectType
            workload.dayOfWeek = _section.dayOfWeek
            workload.timeList = _section.timeSlotList.map(
              ({ startSlot, endSlot }) => {
                const time = new Time()
                time.startSlot = startSlot
                time.endSlot = endSlot
                return time
              }
            )
            workload.isCompensated = workload.isCompensated ?? false
            workload.academicYear = academic_year
            workload.semester = semester
            workload.fieldOfStudy = 'D'
            workload.classYear = _classYear.classYear

            // Step 4: Link workload to teacher then save!
            teacher.workloadList.push(workload)
            await teacher.save()
          }
        }
      }
    }

    if (subjectErrorList.length > 0) {
      throw new NotFoundError(
        `Subject not found: ${[...new Set(subjectErrorList)].join(', ')}`
      )
    }

    const todayDate = new Date()
    setting.webScrapUpdatedDate = todayDate

    await setting.save()
    return todayDate.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  @Get('/web-scrap/updated-date')
  async getUpdatedDate() {
    const setting = await Setting.get()
    const updatedDate = new Date(
      setting.webScrapUpdatedDate
    ).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    return updatedDate
  }

  // TODO: Remove this when go on production
  @Get('/web-scrap/save')
  @UseBefore(schema(IWebScrapQuery, 'query'))
  async scrapDataFromRegKMITLSaveToDatabase(
    @QueryParams() query: IWebScrapQuery
  ) {
    const { academic_year, semester } = query
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academic_year}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = webScrap.extractData()

    for (const _classYear of data) {
      for (const _subject of _classYear.subjectList) {
        for (const _section of _subject.sectionList) {
          let subject = await Subject.findOneByCode(_subject.subjectCode)
          if (!subject) {
            subject = new Subject()
            subject.code = _subject.subjectCode
            subject.name = _subject.subjectName
            subject.credit = _subject.credit
            subject.lectureHours = _subject.lectureHours
            subject.labHours = _subject.labHours
            subject.independentHours = _subject.independentHours
            subject.isRequired = true
          }

          const workload =
            (await Workload.findOne({
              relations: ['subject'],
              where: {
                academicYear: academic_year,
                semester,
                subject: { id: subject.id },
                section: _section.section,
                dayOfWeek: _section.dayOfWeek,
                timeList: { startSlot: _section.timeSlotList[0].startSlot },
              },
            })) || new Workload()
          workload.subject = subject
          workload.section = _section.section
          workload.type = _section.subjectType
          workload.dayOfWeek = _section.dayOfWeek
          workload.timeList = _section.timeSlotList.map(
            ({ startSlot, endSlot }) => {
              const time = new Time()
              time.startSlot = startSlot
              time.endSlot = endSlot
              return time
            }
          )
          workload.isCompensated = false
          workload.academicYear = academic_year
          workload.semester = semester
          workload.fieldOfStudy = 'D'
          workload.classYear = _classYear.classYear

          for (const _teacher of _section.teacherList) {
            let teacher = await Teacher.findByName(_teacher.name, {
              relations: ['workloadList'],
            })
            if (!teacher) {
              teacher = new Teacher()
              teacher.title = _teacher.title
              teacher.name = _teacher.name
              teacher.isExecutive = false
              teacher.workloadList = []
            }

            teacher.workloadList.push(workload)
            await teacher.save()
          }
        }
      }
    }

    return 'Scrap Save-All OK'
  }

  // TODO: Remove this when go on production
  @Get('/web-scrap/save/teacher-only')
  @UseBefore(schema(IWebScrapQuery, 'query'))
  async scrapTeacherFromRegKMITLSaveToDatabase(
    @QueryParams() query: IWebScrapQuery
  ) {
    const { academic_year, semester } = query
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academic_year}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = webScrap.extractData()

    for (const _classYear of data) {
      for (const _subject of _classYear.subjectList) {
        for (const _section of _subject.sectionList) {
          for (const _teacher of _section.teacherList) {
            let teacher = await Teacher.findByName(_teacher.name)
            if (!teacher) {
              teacher = new Teacher()
              teacher.title = _teacher.title
              teacher.name = _teacher.name
              teacher.isExecutive = false
            }
            await teacher.save()
          }
        }
      }
    }

    return 'Scrap Teacher-Only OK'
  }

  // TODO: Remove this when go on production
  @Get('/web-scrap/save/subject-only')
  @UseBefore(schema(IWebScrapQuery, 'query'))
  async scrapSubjectFromRegKMITLSaveToDatabase(
    @QueryParams() query: IWebScrapQuery
  ) {
    const { academic_year, semester } = query
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academic_year}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = webScrap.extractData()

    for (const _classYear of data) {
      for (const _subject of _classYear.subjectList) {
        let subject = await Subject.findOneByCode(_subject.subjectCode)
        if (!subject) {
          subject = new Subject()
          subject.code = _subject.subjectCode
          subject.name = _subject.subjectName
          subject.credit = _subject.credit
          subject.lectureHours = _subject.lectureHours
          subject.labHours = _subject.labHours
          subject.independentHours = _subject.independentHours
          subject.isRequired = true
        }
        await subject.save()
      }
    }

    return 'Scrap Subject-Only OK'
  }

  // TODO: Remove this when go on production
  @Get('/web-scrap/not-save')
  @UseBefore(schema(IWebScrapQuery, 'query'))
  async scrapDataFromRegKMITLNotSaveToDatabase(
    @QueryParams() query: IWebScrapQuery
  ) {
    const { academic_year, semester } = query
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academic_year}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = webScrap.extractData()

    return data
  }
}

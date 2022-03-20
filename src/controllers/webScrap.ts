import {
  Authorized,
  Get,
  JsonController,
  Post,
  QueryParams,
} from 'routing-controllers'
import { uniqBy, chain, isEmpty } from 'lodash'

import { Degree } from '@constants/common'
import { WebScrap } from '@libs/WebScrap'
import { WebScrapV2 } from '@libs/WebScrapV2'
import { ValidateQuery } from '@middlewares/validator'
import { NotFoundError } from '@errors/notFoundError'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { Time } from '@models/time'
import { Room } from '@models/room'
import { TeacherWorkload } from '@models/teacherWorkload'

import { IWebScrapQuery } from './types/webScrap'

@JsonController()
export class WebScrapController {
  @Get('/web-scrap/updated-date')
  @Authorized()
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

  @Post('/web-scrap')
  @ValidateQuery(IWebScrapQuery)
  @Authorized()
  async scrapDataFromRegKMITL(@QueryParams() query: IWebScrapQuery) {
    const { academicYear, semester, save } = query
    const setting = await Setting.get()

    const rawUrl = setting.webScrapUrl.replace(/&year=\d+&semester=\d/g, '')
    setting.webScrapUrl = `${rawUrl}&year=${academicYear}&semester=${semester}`

    const webScrap = new WebScrap(setting.webScrapUrl)
    await webScrap.init()
    const data = webScrap.extractData()

    const subjectErrorList: Pick<Subject, 'code' | 'name'>[] = []
    const teacherErrorList: Pick<Teacher, 'title' | 'name'>[] = []
    const willBeSaveList: TeacherWorkload[] = []

    for (const _classYear of data) {
      for (const _subject of _classYear.subjectList) {
        for (const _section of _subject.sectionList) {
          for (const _teacher of _section.teacherList) {
            // Step 1: Find teacher in DB. If not found then skip to next teacher
            const teacher = await Teacher.findOne({
              where: { name: _teacher.name },
              relations: ['teacherWorkloadList'],
            })
            if (!teacher) {
              teacherErrorList.push({
                title: _teacher.title,
                name: _teacher.name,
              })
              continue
            }

            // Step 2: Find subject in DB. If not found then add to error list and skip
            const subject = await Subject.findOne({
              where: { code: _subject.subjectCode },
            })
            if (!subject) {
              subjectErrorList.push({
                code: _subject.subjectCode,
                name: _subject.subjectName,
              })
              continue
            }

            // Step 3: Find workload in DB. If not found then create it
            let workload = await Workload.findOne({
              relations: ['subject', 'timeList', 'teacherWorkloadList'],
              where: {
                academicYear,
                semester,
                subject: { id: subject.id },
                section: _section.section,
                dayOfWeek: _section.dayOfWeek,
              },
            })
            if (!workload) {
              workload = new Workload()
              workload.subject = subject
              workload.section = _section.section
              workload.type = _section.subjectType
              workload.dayOfWeek = _section.dayOfWeek
              workload.academicYear = academicYear
              workload.semester = semester
              workload.degree = Degree.BACHELOR
              workload.fieldOfStudy = 'D'
              workload.classYear = _classYear.classYear
              workload.timeList = _section.timeSlotList.map(
                ({ startSlot, endSlot }) => Time.create({ startSlot, endSlot })
              )

              // Step 4: Link workload to teacher!
              const teacherWorkload = new TeacherWorkload()
              teacherWorkload.workload = workload
              teacherWorkload.teacher = teacher
              teacherWorkload.isClaim = true
              teacherWorkload.weekCount = 15
              willBeSaveList.push(teacherWorkload)
            }
          }
        }
      }
    }

    if (!isEmpty(teacherErrorList) || !isEmpty(subjectErrorList)) {
      throw new NotFoundError('ไม่พบอาจารย์หรือวิชาดังกล่าว', [
        ...uniqBy(teacherErrorList, 'name')
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((t) => `${t.title}${t.name}`),
        ...uniqBy(subjectErrorList, 'code')
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((s) => `${s.code} - ${s.name}`),
      ])
    }

    const todayDate = new Date()
    setting.webScrapUpdatedDate = todayDate

    if (save === true) {
      await TeacherWorkload.save(willBeSaveList)
      await setting.save()
    }

    return chain(willBeSaveList)
      .map((tw) => ({
        subject: `${tw.workload.subject.code} - ${tw.workload.subject.name}`,
        teacher: `${tw.teacher.title}${tw.teacher.name}`,
      }))
      .uniqBy((each) => `${each.subject} + ${each.teacher}`)
      .groupBy('teacher')
      .mapValues((each) => each.map((e) => e.subject))
      .toPairs()
      .value()
  }

  @Post('/v2/web-scrap')
  @ValidateQuery(IWebScrapQuery)
  @Authorized()
  async scrapDataFromRegKMITLv2(@QueryParams() query: IWebScrapQuery) {
    const { academicYear, semester, save, webId } = query

    const webScrapV2 = new WebScrapV2()
    await webScrapV2.init({ webId, academicYear, semester })
    const data = webScrapV2.extractData()

    // const subjectErrorList: Pick<Subject, 'code' | 'name'>[] = []
    // const teacherErrorList: Pick<Teacher, 'title' | 'name'>[] = []
    const willBeSaveList: TeacherWorkload[] = []

    for (const _classYear of data) {
      for (const _table of _classYear.tableList) {
        for (const _row of _table.rowList) {
          for (const _teacher of _row.teacher) {
            // Step 1: Find teacher in DB. If not found then skip to next teacher
            const teacher = await Teacher.findOne({
              where: { name: _teacher.name },
              relations: ['teacherWorkloadList'],
            })
            if (!teacher) {
              //   teacherErrorList.push({
              //     title: _teacher.title,
              //     name: _teacher.name,
              //   })
              continue
            }

            // Step 2: Find subject in DB. If not found then add to error list and skip
            const subject = await Subject.findOne({
              where: { code: _row.subjectCode },
            })
            if (!subject) {
              //   subjectErrorList.push({
              //     code: _row.subjectCode,
              //     name: _row.subjectName,
              //   })
              continue
            }

            // Step 3: Find workload in DB. If not found then create it
            let workload = await Workload.findOne({
              relations: ['subject', 'timeList', 'teacherWorkloadList'],
              where: {
                academicYear,
                semester,
                subject: { id: subject.id },
                section: _row.section.section,
                dayOfWeek: _row.dateTime[0].dayOfWeek,
              },
            })
            if (!workload) {
              workload = new Workload()
              workload.room = await Room.findOne({ where: { name: _row.room } })
              workload.subject = subject
              workload.section = _row.section.section
              workload.type = _row.section.type
              workload.dayOfWeek = _row.dateTime[0].dayOfWeek
              workload.academicYear = academicYear
              workload.semester = semester
              workload.degree = _classYear.curriculum.degree
              workload.fieldOfStudy = _classYear.curriculum.fieldOfStudy
              workload.classYear = _classYear.classYear
              workload.timeList = _row.dateTime.map(({ startSlot, endSlot }) =>
                Time.create({ startSlot, endSlot })
              )

              // Step 4: Link workload to teacher!
              const teacherWorkload = new TeacherWorkload()
              teacherWorkload.workload = workload
              teacherWorkload.teacher = teacher
              teacherWorkload.isClaim = true
              teacherWorkload.weekCount = 15
              willBeSaveList.push(teacherWorkload)
            }
          }
        }
      }
    }

    // if (!isEmpty(teacherErrorList) || !isEmpty(subjectErrorList)) {
    //   throw new NotFoundError('ไม่พบอาจารย์หรือวิชาดังกล่าว', [
    //     ...uniqBy(teacherErrorList, 'name')
    //       .sort((a, b) => a.name.localeCompare(b.name))
    //       .map((t) => `${t.title}${t.name}`),
    //     ...uniqBy(subjectErrorList, 'code')
    //       .sort((a, b) => a.name.localeCompare(b.name))
    //       .map((s) => `${s.code} - ${s.name}`),
    //   ])
    // }

    const todayDate = new Date()
    const setting = await Setting.get()
    setting.webScrapUpdatedDate = todayDate

    if (save === true) {
      await TeacherWorkload.save(willBeSaveList)
      await setting.save()
    }

    return chain(willBeSaveList)
      .map((tw) => ({
        subject: `${tw.workload.subject.code} - ${tw.workload.subject.name}`,
        teacher: `${tw.teacher.title}${tw.teacher.name}`,
      }))
      .uniqBy((each) => `${each.subject} + ${each.teacher}`)
      .groupBy('teacher')
      .mapValues((each) => each.map((e) => e.subject))
      .toPairs()
      .value()
  }

  // TODO: Remove this when go on production
  @Post('/web-scrap/save/teacher-only')
  @ValidateQuery(IWebScrapQuery)
  async scrapTeacherFromRegKMITLSaveToDatabase(
    @QueryParams() query: IWebScrapQuery
  ) {
    const { academicYear, semester } = query
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academicYear}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = webScrap.extractData()

    const tmpList = []

    for (const _classYear of data) {
      for (const _subject of _classYear.subjectList) {
        for (const _section of _subject.sectionList) {
          for (const _teacher of _section.teacherList) {
            let teacher = await Teacher.findOne({
              where: { name: _teacher.name },
            })
            if (teacher) {
              continue
            }

            teacher = new Teacher()
            teacher.title = _teacher.title
            teacher.name = _teacher.name
            teacher.executiveRole = ''
            teacher.isActive = true
            teacher.isExternal = false
            tmpList.push(teacher)
          }
        }
      }
    }

    const uniqueList = uniqBy(tmpList, 'name')
    await Teacher.save(uniqueList)

    return uniqueList
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((teacher) => `${teacher.title}${teacher.name}`)

    return await Teacher.save(uniqBy(tmpList, 'name'))
  }

  // TODO: Remove this when go on production
  @Post('/web-scrap/save/subject-only')
  @ValidateQuery(IWebScrapQuery)
  async scrapSubjectFromRegKMITLSaveToDatabase(
    @QueryParams() query: IWebScrapQuery
  ) {
    const { academicYear, semester } = query
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academicYear}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = webScrap.extractData()

    const tmpList = []

    for (const _classYear of data) {
      for (const _subject of _classYear.subjectList) {
        let subject = await Subject.findOne({
          where: { code: _subject.subjectCode },
        })
        if (subject) {
          continue
        }

        subject = new Subject()
        subject.code = _subject.subjectCode
        subject.name = _subject.subjectName
        subject.credit = _subject.credit
        subject.lectureHours = _subject.lectureHours
        subject.labHours = _subject.labHours
        subject.independentHours = _subject.independentHours
        subject.isRequired = true
        subject.curriculumCode = 'CE'
        subject.isInter = false
        tmpList.push(subject)
      }
    }

    const uniqueList = uniqBy(tmpList, 'code')
    await Subject.save(uniqueList)

    return uniqueList
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((subject) => `${subject.code} - ${subject.name}`)
  }

  // TODO: Remove this when go on production
  @Post('/web-scrap/not-save')
  @ValidateQuery(IWebScrapQuery)
  async scrapDataFromRegKMITLNotSaveToDatabase(
    @QueryParams() query: IWebScrapQuery
  ) {
    const { academicYear, semester } = query
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academicYear}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = webScrap.extractData()

    return data
  }
}

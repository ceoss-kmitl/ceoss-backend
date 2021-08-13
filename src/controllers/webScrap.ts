import { Get, JsonController } from 'routing-controllers'
import { WebScrap } from '@libs/WebScrap'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Teacher } from '@models/teacher'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class WebScrapController {
  @Get('/web-scrap')
  async scrapDataFromRegKMITL() {
    const academicYear = 2563
    const semester = 1
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academicYear}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = await webScrap.extractData()

    const subjectErrorList: string[] = []
    const teacherErrorList: string[] = []

    for (let i = 0; i < data.length; i++) {
      const _classYear = data[i]

      for (let j = 0; j < _classYear.subjectList.length; j++) {
        const _subject = _classYear.subjectList[j]

        for (let k = 0; k < _subject.sectionList.length; k++) {
          const _section = _subject.sectionList[k]

          const subject = await Subject.findByCode(_subject.subjectCode)
          if (!subject) {
            subjectErrorList.push(
              `[${_subject.subjectCode}]${_subject.subjectName}`
            )
            continue
          }

          const workload =
            (await Workload.findOne({
              relations: ['subject'],
              where: {
                academicYear,
                semester,
                subject: { id: subject.id },
                section: _section.section,
                dayOfWeek: _section.dayOfWeek,
                startTimeSlot: _section.startTimeSlot,
              },
            })) || new Workload()
          workload.subject = subject
          workload.section = _section.section
          workload.type = _section.subjectType
          workload.dayOfWeek = _section.dayOfWeek
          workload.startTimeSlot = _section.startTimeSlot
          workload.endTimeSlot = _section.endTimeSlot
          workload.isCompensated = workload.isCompensated ?? false
          workload.academicYear = academicYear
          workload.semester = semester

          for (let l = 0; l < _section.teacherList.length; l++) {
            const _teacher = _section.teacherList[l]

            const teacher = await Teacher.findByName(_teacher.name, {
              relations: ['workloadList'],
            })
            if (!teacher) {
              teacherErrorList.push(`${_teacher.name}`)
              continue
            }

            teacher.workloadList.push(workload)
            await teacher.save()
          }
        }
      }
    }

    const hasError = subjectErrorList.length || teacherErrorList.length
    if (hasError) {
      const subjectErrorString = `Subject not found: ${
        subjectErrorList.join(', ') || '-'
      }`
      const teacherErrorString = `Teacher not found: ${
        teacherErrorList.join(', ') || '-'
      }`
      throw new NotFoundError(`${subjectErrorString} && ${teacherErrorString}`)
    }

    return 'OK'
  }

  // TODO: Remove this when go on production
  @Get('/web-scrap/save')
  async scrapDataFromRegKMITLSaveToDatabase() {
    const academicYear = 2563
    const semester = 1
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academicYear}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = await webScrap.extractData()

    for (let i = 0; i < data.length; i++) {
      const _year = data[i]

      for (let j = 0; j < _year.subjectList.length; j++) {
        const _subject = _year.subjectList[j]

        for (let k = 0; k < _subject.sectionList.length; k++) {
          const _section = _subject.sectionList[k]

          let subject = await Subject.findByCode(_subject.subjectCode)
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

          const workload = new Workload()
          workload.subject = subject
          workload.section = _section.section
          workload.type = _section.subjectType
          workload.dayOfWeek = _section.dayOfWeek
          workload.startTimeSlot = _section.startTimeSlot
          workload.endTimeSlot = _section.endTimeSlot
          workload.isCompensated = false
          workload.academicYear = academicYear
          workload.semester = semester

          for (let l = 0; l < _section.teacherList.length; l++) {
            const _teacher = _section.teacherList[l]

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

    return 'OK'
  }

  // TODO: Remove this when go on production
  @Get('/web-scrap/not-save')
  async scrapDataFromRegKMITLNotSaveToDatabase() {
    const academicYear = 2563
    const semester = 1
    const URL = `http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=${academicYear}&semester=${semester}`
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = await webScrap.extractData()

    return data
  }
}

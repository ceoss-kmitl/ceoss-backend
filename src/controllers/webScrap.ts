import { Get, JsonController } from 'routing-controllers'
import { WebScrap } from '@libs/WebScrap'
import { Workload } from '@models/workload'
import { Subject } from '@models/subject'
import { Teacher } from '@models/teacher'

@JsonController()
export class WebScrapController {
  @Get('/web-scrap')
  async scrapDataFromRegKMITL() {
    const URL =
      'http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=2563&semester=1'
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = await webScrap.extractData()

    const oldWorkloadList = await Workload.find()
    for (let i = 0; i < oldWorkloadList.length; i++) {
      await oldWorkloadList[i].softRemove()
    }

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

  @Get('/web-scrap/not-save')
  async scrapDataFromRegKMITLNotSaveToDatabase() {
    const URL =
      'http://www.reg.kmitl.ac.th/teachtable_v20/teachtable_show.php?midterm=0&faculty_id=01&dept_id=05&curr_id=19&curr2_id=06&year=2563&semester=1'
    const webScrap = new WebScrap(URL)
    await webScrap.init()
    const data = await webScrap.extractData()

    return data
  }
}

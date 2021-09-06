import { Response } from 'express'
import { Excel, PaperSize } from '@libs/Excel'
import { IGetWorkloadExcel3OutQuery } from '@controllers/types/workload'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { WorkloadType } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'

export async function generateWorkloadExcel3Out(
  response: Response,
  query: IGetWorkloadExcel3OutQuery
) {
  const { teacher_id, academic_year, semester } = query

  const teacher = await Teacher.findOne(teacher_id, {
    relations: ['workloadList', 'workloadList.subject'],
  })
  if (!teacher) throw new NotFoundError(`Teacher ${teacher_id} is not found`)

  teacher.workloadList = teacher.workloadList.filter(
    (workload) =>
      workload.academicYear === academic_year && workload.semester === semester
  )

  const setting = await Setting.get()

  // ===== Excel setup =====
  const excel = new Excel(response, {
    pageSetup: {
      paperSize: PaperSize.A4,
      orientation: 'landscape',
      verticalCentered: true,
      horizontalCentered: true,
      fitToPage: true,
      printArea: 'A1:W24',
      margins: {
        top: 0.16,
        bottom: 0.16,
        left: 0.16,
        right: 0.16,
        header: 0,
        footer: 0,
      },
    },
    views: [{ style: 'pageLayout' }],
    properties: {
      defaultColWidth: Excel.pxCol(55),
      defaultRowHeight: Excel.pxRow(28),
    },
  })

  // ===== Title =====
  excel.font('TH SarabunPSK').fontSize(14)
  excel.cell('H1').value(`ใบเบิกค่าสอนพิเศษ (อาจารย์ภายนอก)`).align('left')
  excel.cell('A2').value(`ผู้สอน`).align('left')
  excel.cell('B2').value(`${teacher.title}${teacher.name}`).align('left')
  excel.cell('E2').value(`ตำแหน่ง อาจารย์พิเศษ/อาจารย์ภายนอก`).align('left')
  excel.cell('I2').value(`☑ ปริญญาตรี`).align('left')
  excel.cell('L2').value(`⬜ บัณฑิตศึกษา`).align('left')
  excel
    .cell('O2')
    .value(`ภาคการศึกษาที่ ${semester}/${academic_year}`)
    .align('left')
  excel.cell('U2').value(`คณะวิศวกรรมศาสตร์`).align('left')

  return excel.createFile(`03_ใบเบิกค่าสอน อาจารย์ภายนอก_${teacher.name}`)
}

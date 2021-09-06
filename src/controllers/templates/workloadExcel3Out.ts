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

  // ===== header ====
  excel.cell('A3').border('left', 'top')
  excel.cell('A4').value('วันสอน').border('left').align('center')
  excel.cell('A5').border('left', 'bottom')

  excel.cells('B3:E5').value('รหัสวิชา').border('box').align('center')

  excel.cell('F3').border('right', 'top')
  excel.cell('F4').value('หน่วยกิต').border('right').align('center')
  excel.cell('F5').value('(ท.-ป.)').border('right', 'bottom').align('center')

  excel.cell('G3').border('top')
  excel.cell('G4').value('สาขา,ชั้นปี').border('right').align('center')
  excel.cell('G5').value('ห้อง,กลุ่ม').border('right', 'bottom').align('center')

  excel.cells('H3:I3').value('เวลาที่สอน').border('box').align('center')
  excel.cell('H4').value('ทฤษฎี').border('right').align('center')
  excel.cell('H5').border('right', 'bottom')
  excel.cell('I4').value('ปฏิบัติ').border('right').align('center')
  excel.cell('I5').border('right', 'bottom')

  excel.cells('J3:M3').value('จำนวนชั่วโมงสอน').border('box').align('center')
  excel.cells('J4:K4').value('ปริญญาตรี').border('box').align('center')
  excel.cells('L4:M4').value('บัณฑิตศึกษา').border('box').align('center')
  excel.cell('J5').value('ทั่วไป').border('box').align('center')
  excel.cell('K5').value('นานาชาติ').border('box').align('center')
  excel.cell('L5').value('ทั่วไป').border('box').align('center')
  excel.cell('M5').value('นานาชาติ').border('box').align('center')

  excel.cells('N3:T3').value('เดือน??????').border('box').align('center')
  {
    let week = 0
    for (const col of Excel.range('N:T')) {
      excel
        .cell(`${col}4`)
        .value(week + 1)
        .border('box')
        .align('center')
      week++
    }
  }
  excel.cells('N5:T5').value('วันที่').border('box').align('center')

  excel.cell('U3').value('จำนวน').border('right', 'top').align('center')
  excel.cell('U4').value('สัปดาห์').border('right').align('center')
  excel.cell('U5').value('ที่สอน').border('right', 'bottom').align('center')

  excel.cell('V3').value('จำนวน').border('right', 'top').align('center')
  excel.cell('V4').value('ชั่วโมง').border('right').align('center')
  excel.cell('V5').value('ที่สอน').border('right', 'bottom').align('center')

  excel.cell('W3').border('right', 'top')
  excel.cell('W4').border('right')
  excel.cell('W5').value('หมายเหตุ').border('right', 'bottom').align('center')

  return excel.createFile(`03_ใบเบิกค่าสอน อาจารย์ภายนอก_${teacher.name}`)
}

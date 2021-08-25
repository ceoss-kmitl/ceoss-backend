import { Response } from 'express'
import { Excel, PaperSize } from '@libs/Excel'
import { Teacher } from '@models/teacher'

export function generateExcelFile1(
  response: Response,
  academicYear: number,
  semester: number,
  teacher: Teacher
) {
  const excel = new Excel(response, {
    pageSetup: { paperSize: PaperSize.A4 },
    properties: {
      defaultColWidth: Excel.pxCol(16),
      defaultRowHeight: Excel.pxRow(17),
    },
  })

  // Global font
  excel.font('TH SarabunPSK').fontSize(14)

  // Table title
  excel
    .cells('A1', 'BB1')
    .value(
      `ตารางการปฏิบัติงานสอนของอาจารย์คณะวิศวกรรมศาสตร์ สจล.  ประจำภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`
    )
    .bold()
    .align('center', 'middle')
  excel
    .cells('A2', 'BB2')
    .value(
      `ชื่อ  ${teacher.title}${teacher.name}  ภาควิชาวิศวกรรมคอมพิวเตอร์ 08.30 - 16.30`
    )
    .bold()
    .align('center', 'middle')
  excel
    .cells('A3', 'BB3')
    .value(
      'งานที่สอนให้เขียนรหัสวิชา ชื่อวิชา เป็นการสอนแบบทฤษฎี(ท) หรือปฏิบัติ(ป) ชั้นปี ห้อง'
    )
    .bold()
    .align('center', 'middle')

  return excel
}

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

  // Table title
  excel.font('TH SarabunPSK').fontSize(14)
  excel
    .cells('A1', 'BA1')
    .value(
      `ตารางการปฏิบัติงานสอนของอาจารย์คณะวิศวกรรมศาสตร์ สจล.  ประจำภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`
    )
    .bold()

  return excel
}

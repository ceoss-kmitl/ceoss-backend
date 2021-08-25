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

  // ===== Title =====
  excel.font('TH SarabunPSK').fontSize(14)
  excel
    .cells('A1:BB1')
    .value(
      `ตารางการปฏิบัติงานสอนของอาจารย์คณะวิศวกรรมศาสตร์ สจล.  ประจำภาคเรียนที่ ${semester} ปีการศึกษา ${academicYear}`
    )
    .bold()
    .align('center', 'middle')
  excel
    .cells('A2:BB2')
    .value(
      `ชื่อ  ${teacher.title}${teacher.name}    ภาควิชาวิศวกรรมคอมพิวเตอร์       เวลาปฏิบัติราชการ  08.30 - 16.30`
    )
    .bold()
    .align('center', 'middle')
  excel
    .cells('A3:BB3')
    .value(
      'งานที่สอนให้เขียนรหัสวิชา ชื่อวิชา เป็นการสอนแบบทฤษฎี(ท) หรือปฏิบัติ(ป) ชั้นปี ห้อง'
    )
    .bold()
    .align('center', 'middle')

  // ===== Date-Time corner header =====
  excel.fontSize(8)
  excel.cell('A5').value('เวลา').border('left', 'top').align('right', 'top')
  excel.cell('B5').border('top', 'right', 'diagonal-up')
  excel.cell('A6').border('left', 'bottom', 'diagonal-up')
  excel
    .cell('B6')
    .value('วัน')
    .border('right', 'bottom')
    .align('left', 'bottom')
  excel.cell('C5').value('ชม.').border('box').align('center', 'middle')
  excel.cell('C6').value('นาที').border('box').align('center', 'middle')

  // ===== Time hours header ====
  excel.fontSize(12)
  {
    let hours = 8
    for (const col of ['D:G', 'H:K', 'L:O', 'P:S']) {
      const [start, end] = col.split(':')
      excel
        .cells(`${start}5:${end}5`)
        .value(hours++)
        .border('box')
        .align('center', 'middle')
    }
  }
  excel.cells('T5:V5').value('12.00').border('box').align('center', 'middle')
  {
    let hours = 13
    for (const col of [
      'W:Z',
      'AA:AD',
      'AE:AH',
      'AI:AL',
      'AM:AP',
      'AQ:AT',
      'AU:AX',
      'AY:BB',
    ]) {
      const [start, end] = col.split(':')
      excel
        .cells(`${start}5:${end}5`)
        .value(hours++)
        .border('box')
        .align('center', 'middle')
    }
  }

  // ===== Time minute header =====
  excel.fontSize(10)
  {
    let minute = 0
    for (const col of Excel.range('D:S')) {
      excel
        .cell(`${col}6`)
        .value((minute + 1) * 15)
        .border('box')
        .align('center', 'middle')
      minute = (minute + 1) % 4
    }
  }
  {
    let minute = 0
    for (const col of Excel.range('T:V')) {
      excel
        .cell(`${col}6`)
        .value((minute + 1) * 15)
        .border('box')
        .align('center', 'middle')
      minute = (minute + 1) % 3
    }
  }
  {
    let minute = 0
    for (const col of Excel.range('W:BB')) {
      excel
        .cell(`${col}6`)
        .value((minute + 1) * 15)
        .border('box')
        .align('center', 'middle')
      minute = (minute + 1) % 4
    }
  }

  // ===== Day side header =====
  excel.fontSize(12)
  excel.cells('A7:C8').value('จันทร์').border('box').align('center', 'middle')
  excel.cells('A9:C10').value('อังคาร').border('box').align('center', 'middle')
  excel.cells('A11:C12').value('พุธ').border('box').align('center', 'middle')
  excel
    .cells('A13:C14')
    .value('พฤหัสบดี')
    .border('box')
    .align('center', 'middle')
  excel.cells('A15:C16').value('ศุกร์').border('box').align('center', 'middle')
  excel.cells('A17:C18').value('เสาร์').border('box').align('center', 'middle')
  excel
    .cells('A19:C20')
    .value('อาทิตย์')
    .border('box')
    .align('center', 'middle')

  // ===== Grid all time slot =====
  for (let row = 7; row <= 20; row++) {
    for (const col of Excel.range('D:S')) {
      excel.cell(`${col}${row}`).border('box')
    }
    for (const col of Excel.range('W:BB')) {
      excel.cell(`${col}${row}`).border('box')
    }
  }
  excel.cell('T20').border('bottom')
  excel.cell('U20').border('bottom')
  excel.cell('V20').border('bottom')

  return excel
}

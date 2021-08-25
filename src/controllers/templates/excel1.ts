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
    for (const range of ['D5:G5', 'H5:K5', 'L5:O5', 'P5:S5']) {
      excel
        .cells(range)
        .value(hours++)
        .border('box')
        .align('center', 'middle')
    }
  }
  excel.cells('T5:V5').value('12.00').border('box').align('center', 'middle')
  {
    let hours = 13
    for (const range of [
      'W5:Z5',
      'AA5:AD5',
      'AE5:AH5',
      'AI5:AL5',
      'AM5:AP5',
      'AQ5:AT5',
      'AU5:AX5',
      'AY5:BB5',
    ]) {
      excel
        .cells(range)
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
  for (const day of [
    'A7:C8 จันทร์',
    'A9:C10 อังคาร',
    'A11:C12 พุธ',
    'A13:C14 พฤหัสบดี',
    'A15:C16 ศุกร์',
    'A17:C18 เสาร์',
    'A19:C20 อาทิตย์',
  ]) {
    const [range, name] = day.split(' ')
    excel.cells(range).value(name).border('box').align('center', 'middle')
  }

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

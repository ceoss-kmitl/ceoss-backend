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
      defaultColWidth: Excel.pxCol(60),
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

  // ===== workload =====
  teacher.workloadList.forEach((workload, index) => {
    const { subject, type, classYear, dayOfWeek } = workload

    const subjectType = {
      [WorkloadType.Lecture]: '(ท)',
      [WorkloadType.Lab]: '(ป)',
    }

    // ===== Subject column =====
    const day = [
      '',
      'จันทร์',
      'อังคาร',
      'พุธ',
      'พฤหัส',
      'ศุกร์',
      'เสาร์',
      'อาทิตย์',
    ]
    excel
      .cell(`A${6 + index}`)
      .value(`${day[dayOfWeek]}`)
      .border('right', 'left')
      .align('center')

    excel
      .cells(`B${6 + index}:E${6 + index}`)
      .value(`${subject.code} ${subject.name} ${subjectType[type]}`)
      .border('right', 'left')
      .align('left')

    excel
      .cell(`F${6 + index}`)
      .value(`${subject.credit}`)
      .border('right', 'left')
      .align('center')
  })

  // ===== Least 3 rows =====
  let row = teacher.workloadList.length + 6
  if (row < 9) {
    for (row; row < 9; row++) {
      excel.cell(`A${row}`).border('right', 'left')
      excel.cells(`B${row}:E${row}`).border('right')
      for (const col of Excel.range('F:W')) {
        excel.cell(`${col}${row}`).border('right')
      }
    }
  }

  // ===== Hour Summary =====
  excel
    .cells(`A${row}:E${row}`)
    .value('รวมหน่วยชั่วโมง ที่ทำการสอนทั้งสิ้น')
    .border('box')
    .align('center')
  for (const col of Excel.range('F:U')) {
    excel.cell(`${col}${row}`).border('box')
  }
  excel
    .cell(`V${row}`)
    .formula(`SUM(V6:V${row - 1})`)
    .border('box')
    .align('center')
  excel.cell(`W${row}`).border('box')

  // ===== Claim table =====
  excel.cell(`A${row + 2}`).align('left')
  excel
    .cells(`A${row + 3}:B${row + 3}`)
    .value('ระดับ')
    .align('center')
    .border('box')

  const colName = ['รวมชั่วโมง', 'ชั่วโมงละ', 'เงินรายได้', 'เงินงบประมาณ']
  {
    let index = 0
    for (const col of Excel.range('C:F')) {
      excel
        .cell(`${col}${row + 3}`)
        .value(`${colName[index]}`)
        .border('box')
        .align('center')
      index++
    }
  }
  excel
    .cells(`G${row + 3}:H${row + 3}`)
    .value('รวมเงินแต่ละระดับ')
    .align('center')
    .border('box')

  // ===== degree =====
  const degree = [
    '1. ปริญญาตรี ทั่วไป',
    '2. ปริญญาตรี ต่อเนื่อง',
    '3. ปริญญาตรี นานาชาติ SE',
    '4. บัณฑิตทั่วไป',
    '5. บัณฑิต นานาชาติ',
  ]
  {
    for (let i = 0; i <= 4; i++) {
      excel
        .cells(`A${row + 4 + i}:B${row + 4 + i}`)
        .value(`${degree[i]}`)
        .border('box')
        .align('left')
    }
  }

  // ===== Claim Summary =====
  excel
    .cells(`A${row + 9}:B${row + 9}`)
    .value('รวม')
    .border('box')
    .align('center')
  excel
    .cells(`C${row + 9}:F${row + 9}`)
    .value('กี่บาทถ้วน')
    .border('box')
    .align('center')
  excel
    .cells(`G${row + 9}:H${row + 9}`)
    .formula(`SUM(G${row + 4}:H${row + 8})`)
    .border('box')
    .align('center')

  // ===== Sign area =====
  excel.fontSize(14)
  excel
    .cells(`B${row + 11}:E${row + 11}`)
    .value('ขอรับรองว่ามีการเรียนการสอนตามที่เบิก-จ่าย')
    .align('center')
  excel
    .cells(`B${row + 13}:E${row + 13}`)
    .value('...........................................')
    .align('center')
  excel
    .cells(`B${row + 14}:E${row + 14}`)
    .value(`(${teacher.title}${teacher.name})`)
    .align('center')
  excel
    .cells(`B${row + 15}:E${row + 15}`)
    .value('ผู้ทำ(ผู้สอน)')
    .align('center')

  excel
    .cells(`F${row + 11}:J${row + 11}`)
    .value('ตรวจสอบแล้วมีการเรียนการสอนตามที่เบิก-จ่าย')
    .align('center')
  excel
    .cells(`F${row + 13}:J${row + 13}`)
    .value('...........................................')
    .align('center')
  excel
    .cells(`F${row + 14}:J${row + 14}`)
    .value(`(${setting.headName})`)
    .align('center')
  excel
    .cells(`F${row + 15}:J${row + 15}`)
    .value('หัวหน้าภาค')
    .align('center')

  excel
    .cells(`K${row + 11}:O${row + 11}`)
    .value('ตรวจสอบแล้วมีการสอนตามที่เบิก-จ่าย')
    .align('center')
  excel
    .cells(`K${row + 13}:O${row + 13}`)
    .value('...........................................')
    .align('center')
  excel
    .cells(`K${row + 14}:O${row + 14}`)
    .value(`(${setting.directorSIIEName})`)
    .align('center')
  excel
    .cells(`K${row + 15}:O${row + 15}`)
    .value('ผู้อำนวยการ SIIE')
    .align('center')

  excel
    .cells(`P${row + 11}:S${row + 11}`)
    .value('ผู้อนุมัติ')
    .align('center')
  excel
    .cells(`P${row + 13}:S${row + 13}`)
    .value('...........................................')
    .align('center')
  excel
    .cells(`P${row + 14}:S${row + 14}`)
    .value(`(${setting.deanName})`)
    .align('center')
  excel
    .cells(`P${row + 15}:S${row + 15}`)
    .value('คณบดีคณะวิศวกรรมศาสตร์')
    .align('center')

  return excel.createFile(`03_ใบเบิกค่าสอน อาจารย์ภายนอก_${teacher.name}`)
}

import { Response } from 'express'
import { Excel, PaperSize } from '@libs/Excel'
import { mapTimeSlotToTime } from '@libs/mapper'
import { IGetWorkloadExcel3Query } from '@controllers/types/workload'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { DayOfWeek, WorkloadType } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'

// CEPP, PROJECT1, PROJECT2
const FILTERED_SUBJECT = ['01076014', '01076311', '01076312']

export async function generateWorkloadExcel3(
  response: Response,
  query: IGetWorkloadExcel3Query
) {
  const { teacher_id, academic_year, semester } = query

  const teacher = await Teacher.findOne(teacher_id, {
    relations: [
      'teacherWorkloadList',
      'teacherWorkloadList.workload',
      'teacherWorkloadList.workload.timeList',
      'teacherWorkloadList.workload.subject',
    ],
  })
  if (!teacher)
    throw new NotFoundError('ไม่พบอาจารย์ดังกล่าว', [
      `Teacher ${teacher_id} is not found`,
    ])

  teacher.teacherWorkloadList = teacher
    .filterTeacherWorkloadList({
      academicYear: academic_year,
      semester,
    })
    .filter((tw) => !FILTERED_SUBJECT.includes(tw.workload.subject.code))
    .sort(
      (a, b) =>
        a.workload.dayOfWeek - b.workload.dayOfWeek ||
        a.workload.getFirstTimeSlot() - b.workload.getFirstTimeSlot()
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
      printArea: 'A1:Y32',
      margins: {
        top: 0.16,
        bottom: 0.16,
        left: 0.16,
        right: 0.16,
        header: 0,
        footer: 0,
      },
    },
    properties: {
      defaultColWidth: Excel.pxCol(38),
      defaultRowHeight: Excel.pxRow(19),
    },
  })

  // ===== Configue font & width some column =====
  excel.font('TH SarabunPSK')
  excel.cell('B1').width(Excel.pxCol(118))
  excel.cell('C1').width(Excel.pxCol(46))
  excel.cell('D1').width(Excel.pxCol(46))
  excel.cell('E1').width(Excel.pxCol(46))
  excel.cell('F1').width(Excel.pxCol(46))
  excel.cell('G1').width(Excel.pxCol(46))
  excel.cell('H1').width(Excel.pxCol(64))
  excel.cell('I1').width(Excel.pxCol(64))
  excel.cell('L1').width(Excel.pxCol(46))
  excel.cell('O1').width(Excel.pxCol(46))
  excel.cell('R1').width(Excel.pxCol(46))
  excel.cell('U1').width(Excel.pxCol(46))
  excel.cell('X1').width(Excel.pxCol(46))
  excel.cell('Y1').width(Excel.pxCol(46))

  // ===== Title - Teacher details =====
  excel.fontSize(13)
  excel.cells('H1:I1').value('ใบเบิกค่าสอนพิเศษ')
  excel.cell('A2').value('ผู้สอน')
  excel.cells('B2:E2').value(`${teacher.title}${teacher.name}`).shrink()
  excel.cell('A3').value('สังกัด')
  excel
    .cells('B3:E3')
    .value('ภาควิชาวิศกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์')
    .shrink()
  excel.cells('F2:K2').value('ตำแหน่งบริหาร').shrink()

  // ===== Title - Checkbox =====
  excel.cells('M2:O2').value('⬜ ข้าราชการ')
  excel.cells('Q2:S2').value('☑ ปริญญาตรี')
  excel.cells('M3:O3').value('☑ พนักงานสถาบันฯ')
  excel.cells('Q3:S3').value('⬜ บัณฑิตศึกษา')
  excel.cells('U2:X2').value(`ภาคการศึกษาที่ ${semester}/${academic_year}`)
  excel.cells('U3:V3').value('ภาระงานสอน')
  excel.cell('W3').value(150).align('center')
  excel.cell('X3').value('ชม.')

  // ===== Table header - Subject day, credit, time =====
  excel.cells('A4:A6').value('วันสอน').border('box').align('center')
  excel.cells('B4:E6').value('รหัสวิชา').border('box').align('center')
  excel.cell('F4').border('top', 'right')
  excel.cell('F5').value('หน่วยกิต').border('right').align('center')
  excel.cell('F6').value('(ท.-ป.)').border('bottom', 'right').align('center')
  excel.cell('G4').border('top', 'right')
  excel.cell('G5').value('สาขา,ชั้นปี').border('right').align('center')
  excel.cell('G6').value('ห้อง,กลุ่ม').border('bottom', 'right').align('center')
  excel.cells('H4:I4').value('เวลาที่สอน').border('box').align('center')
  excel.cell('H5').value('ทฤษฎี').border('right').align('center')
  excel.cell('H6').border('bottom', 'right')
  excel.cell('I5').value('ปฏิบัติ').border('right').align('center')
  excel.cell('I6').border('bottom', 'right')

  // ===== Table header - Hours per week =====
  {
    const ALPHA = 'J'
    const ROW = 4
    const group = [
      'ปริญญาตรี ทั่วไป',
      'ปริญญาตรี ต่อเนื่อง',
      'ปริญญาตรี นานาชาติ',
      'บัณฑิต ทั่วไป',
      'บัณฑิต นานาชาติ',
    ]
    const subGroup = ['หน่วย|ชม.', 'จำนวน|สัปดาห์', 'รวมหน่วย|ชม./สัปดาห์']

    group.forEach((each, index) => {
      const startAlpha = Excel.toAlphabet(Excel.toNumber(ALPHA) + 3 * index)
      const endAlpha = Excel.toAlphabet(Excel.toNumber(startAlpha) + 2)

      excel
        .cells(`${startAlpha}${ROW}:${endAlpha}${ROW}`)
        .value(each)
        .border('box')
        .align('center')

      subGroup.forEach((eachSub, index2) => {
        const [sub1, sub2] = eachSub.split('|')
        const subStartAlpha = Excel.toAlphabet(
          Excel.toNumber(startAlpha) + index2
        )

        excel
          .cell(`${subStartAlpha}${ROW + 1}`)
          .value(sub1)
          .border('right')
          .align('center')
          .shrink()
        excel
          .cell(`${subStartAlpha}${ROW + 2}`)
          .value(sub2)
          .border('bottom', 'right')
          .align('center')
          .shrink()
      })
    })
  }
  excel.cell('Y4').border('box')
  excel.cells('Y5:Y6').value('หมายเหตุ').border('box').align('center', 'top')

  // ===== Each workload row =====
  let currentDay: DayOfWeek | null = null
  let currentRow = 7
  const DayName = {
    [DayOfWeek.Monday]: 'จันทร์',
    [DayOfWeek.Tuesday]: 'อังคาร',
    [DayOfWeek.Wednesday]: 'พุธ',
    [DayOfWeek.Thursday]: 'พฤหัส',
    [DayOfWeek.Friday]: 'ศุกร์',
    [DayOfWeek.Saturday]: 'เสาร์',
    [DayOfWeek.Sunday]: 'อาทิตย์',
  }
  const SubjectType = {
    [WorkloadType.Lab]: '(ป)',
    [WorkloadType.Lecture]: '(ท)',
  }
  for (const workload of teacher.getWorkloadList()) {
    for (const time of workload.timeList) {
      const { dayOfWeek, subject, classYear, fieldOfStudy, section } = workload

      // Render Day
      if (dayOfWeek !== currentDay) {
        currentDay = workload.dayOfWeek
        excel
          .cell(`A${currentRow}`)
          .value(DayName[currentDay])
          .border('box')
          .align('center')
      } else {
        excel.cell(`A${currentRow}`).border('box')
      }

      // Render subject
      excel
        .cells(`B${currentRow}:E${currentRow}`)
        .value(`${subject.code} ${subject.name} ${SubjectType[workload.type]}`)
        .border('box')
        .shrink()

      // Render credit
      excel
        .cell(`F${currentRow}`)
        .value(
          `${subject.credit}(${subject.lectureHours}-${subject.labHours}-${subject.independentHours})`
        )
        .border('box')
        .align('center')

      // Render class room
      excel
        .cell(`G${currentRow}`)
        .value(`ปี ${classYear} ${fieldOfStudy}/${section}`)
        .border('box')
        .align('center')
        .shrink()

      // Render time
      excel.cell(`H${currentRow}`).border('box')
      excel.cell(`I${currentRow}`).border('box')
      {
        const column = workload.type === WorkloadType.Lecture ? 'H' : 'I'
        const startTime = mapTimeSlotToTime(time.startSlot, '.')
        const endTime = mapTimeSlotToTime(time.endSlot, '.')
        excel
          .cell(`${column}${currentRow}`)
          .value(`${startTime}-${endTime}`)
          .align('center')
          .shrink()
      }

      // Render hours per week
      let hoursUnit = (time.endSlot + 1 - time.startSlot) / 4
      if (workload.type === WorkloadType.Lab) hoursUnit /= 2
      excel
        .cell(`J${currentRow}`)
        .value(hoursUnit)
        .border('box')
        .align('center')
      excel.cell(`K${currentRow}`).value(15).border('box').align('center')
      excel
        .cell(`L${currentRow}`)
        .formula(`J${currentRow}*K${currentRow}`)
        .border('box')
        .align('center')

      // End of this row. Starting new row in new loop
      currentRow++
    }
  }
  // Fill remaining space
  for (; currentRow <= 20; currentRow++) {
    excel.cell(`A${currentRow}`).border('box')
    excel.cells(`B${currentRow}:E${currentRow}`).border('box')
    for (const col of Excel.range('F:Y')) {
      excel.cell(`${col}${currentRow}`).border('box')
    }
  }

  // ===== Render table footer - row 1 =====
  excel.cell(`A${currentRow}`).border('left', 'top-bold')
  excel
    .cells(`B${currentRow}:E${currentRow}`)
    .value('รวมหน่วย ชม. ที่ทำการสอนทั้งสิ้น')
    .border('top-bold')
  for (const col of Excel.range('F:K')) {
    excel.cell(`${col}${currentRow}`).border('box', 'top-bold')
  }
  excel
    .cell(`L${currentRow}`)
    .formula(`SUM(L7:L${currentRow - 1})`)
    .align('center')
    .border('box', 'top-bold')
  for (const col of Excel.range('M:Y')) {
    excel.cell(`${col}${currentRow}`).border('box', 'top-bold')
  }
  currentRow++

  // ===== Render table footer - row 2 =====
  excel.cell(`A${currentRow}`).border('left', 'top')
  excel
    .cells(`B${currentRow}:E${currentRow}`)
    .value('หัก หน่วย ชม. ที่ใช้เป็นภาระงานสอน')
    .border('top')
  for (const col of Excel.range('F:K')) {
    excel.cell(`${col}${currentRow}`).border('box')
  }
  excel.cell(`L${currentRow}`).formula('W3').align('center').border('box')
  for (const col of Excel.range('M:Y')) {
    excel.cell(`${col}${currentRow}`).border('box')
  }
  currentRow++

  // ===== Render table footer - row 3 =====
  excel.cell(`A${currentRow}`).border('left', 'top', 'bottom-double')
  excel
    .cells(`B${currentRow}:E${currentRow}`)
    .value('จำนวนหน่วยชั่วโมงที่เบิกได้')
    .border('top', 'bottom-double')
  for (const col of Excel.range('F:K')) {
    excel.cell(`${col}${currentRow}`).border('box', 'bottom-double')
  }
  excel
    .cell(`L${currentRow}`)
    .formula(`L${currentRow - 2}-L${currentRow - 1}`)
    .align('center')
    .border('box', 'bottom-double')
  for (const col of Excel.range('M:Y')) {
    excel.cell(`${col}${currentRow}`).border('box', 'bottom-double')
  }

  // ===== Render bottom table
  {
    let row = currentRow + 2
    excel
      .cells(`A${row}:E${row}`)
      .value('รวมจำนวนหน่วยชั่วโมง/จำนวนเงิน ที่ขอเบิกต่อภาคการศึกษา')
    row++

    excel.cells(`A${row}:B${row}`).value('ระดับ').border('box').align('center')
    excel.cell(`C${row}`).value('รวมชั่วโมง').border('box').align('center')
    excel.cell(`D${row}`).value('ชั่วโมงละ').border('box').align('center')
    excel.cell(`E${row}`).value('เงินรายได้').border('box').align('center')
    excel
      .cells(`F${row}:G${row}`)
      .value('ขอเบิกเพียง')
      .border('box')
      .align('center')
    row++

    // Row 1
    excel.cells(`A${row}:B${row}`).value('1. ปริญญาตรี ทั่วไป').border('box')
    for (const col of Excel.range('C:E')) {
      excel.cell(`${col}${row}`).border('box')
    }
    excel.cells(`F${row}:G${row}`).border('box')
    row++

    // Row 2
    excel.cells(`A${row}:B${row}`).value('2. ปริญญาตรี ต่อเนื่อง').border('box')
    for (const col of Excel.range('C:E')) {
      excel.cell(`${col}${row}`).border('box')
    }
    excel.cells(`F${row}:G${row}`).border('box')
    row++

    // Row 3
    excel.cells(`A${row}:B${row}`).value('3. ปริญญาตรี นานาชาติ').border('box')
    for (const col of Excel.range('C:E')) {
      excel.cell(`${col}${row}`).border('box')
    }
    excel.cells(`F${row}:G${row}`).border('box')
    row++

    // Row 4
    excel.cells(`A${row}:B${row}`).value('4. บัณฑิต ทั่วไป').border('box')
    for (const col of Excel.range('C:E')) {
      excel.cell(`${col}${row}`).border('box')
    }
    excel.cells(`F${row}:G${row}`).border('box')
    row++

    // Row 5
    excel.cells(`A${row}:B${row}`).value('5. บัณฑิต นานาชาติ').border('box')
    for (const col of Excel.range('C:E')) {
      excel.cell(`${col}${row}`).border('box')
    }
    excel.cells(`F${row}:G${row}`).border('box')
    row++

    // Row 6 : Total
    excel.cell(`A${row}`).value('รวม').border('box')
    excel
      .cells(`B${row}:D${row}`)
      .formula(`"("&BAHTTEXT(F${row})&")"`)
      .border('box')
      .align('center')
    excel.cell(`E${row}`).border('box')
    excel.cells(`F${row}:G${row}`).border('box')
  }

  // ===== Sign area =====
  {
    let row = currentRow + 4
    excel
      .cells(`H${row}:L${row}`)
      .value('ขอรับรองว่ามีการเรียนการสอนตามที่เบิก-จ่าย')
      .align('center')
    excel
      .cells(`N${row}:T${row}`)
      .value('ตรวจสอบแล้วมีการเรียนการสอนตามที่เบิก-จ่าย')
    excel.cells(`V${row}:W${row}`).value('ผู้อนุมัติ').align('center')
    row += 3

    excel.cells(`H${row}:J${row}`).value('……………………………..………..').align('center')
    excel.cells(`O${row}:R${row}`).value('……………………………………...').align('center')
    excel.cells(`U${row}:Y${row}`).value('……………………………………..').align('center')
    row++

    excel
      .cells(`H${row}:K${row}`)
      .value(`(${teacher.title}${teacher.name})`)
      .align('center')
      .shrink()
    excel
      .cells(`O${row}:R${row}`)
      .value(`(${setting.headName})`)
      .align('center')
      .shrink()
    excel
      .cells(`U${row}:Y${row}`)
      .value(`(${setting.deanName})`)
      .align('center')
      .shrink()
    row++

    excel.cells(`H${row}:K${row}`).value('ผู้เบิก/ผู้สอน').align('center')
    excel.cells(`O${row}:R${row}`).value('หัวหน้าภาค').align('center')
    excel
      .cells(`U${row}:Y${row}`)
      .value('คณบดีคณะวิศวกรรมศาสตร์')
      .align('center')
  }

  return excel.createFile(
    `03_ใบเบิกค่าสอน ${semester}-${String(academic_year).substr(2, 2)} คอม-${
      teacher.name
    }`
  )
}

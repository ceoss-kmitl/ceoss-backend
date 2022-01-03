import { DayOfWeek, WorkloadType, Degree } from '@constants/common'
import { Excel, PaperSize } from '@libs/Excel'
import { NotFoundError } from '@errors/notFoundError'
import { IDownloadExtTeacherWorkloadExcelQuery } from '@controllers/types/teacher'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { Time } from '@models/time'

export async function generateWorkloadExcel3External(
  excel: Excel,
  teacher: Teacher,
  query: IDownloadExtTeacherWorkloadExcelQuery
) {
  const { month, workloadList, academicYear, semester } = query

  teacher.teacherWorkloadList = teacher.teacherWorkloadList.sort(
    (a, b) =>
      a.workload.dayOfWeek - b.workload.dayOfWeek ||
      a.workload.getFirstTimeSlot() - b.workload.getFirstTimeSlot()
  )

  const setting = await Setting.get()

  // ===== Excel setup =====
  excel.addSheet(`${month}`, {
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
    properties: {
      defaultColWidth: Excel.pxCol(60),
      defaultRowHeight: Excel.pxRow(28),
    },
  })

  // Variable to check which degree has claimed
  const isClaimDegree = {
    [Degree.BACHELOR]: false,
    [Degree.BACHELOR_CONTINUE]: false,
    [Degree.BACHELOR_INTER]: false,
    [Degree.PUNDIT]: false,
    [Degree.PUNDIT_INTER]: false,
  }

  // Use for render summary table at the bottom left
  type ISummary = {
    degreeThai: string
    degree: Degree
    payRate: number
    totalHours: number
    claimAmount: number
    subList: (Omit<ISummary, 'subList'> & { fieldOfStudy: string })[]
  }
  const summaryClaim: ISummary[] = [
    {
      degreeThai: 'ปริญญาตรี ทั่วไป',
      degree: Degree.BACHELOR,
      payRate: setting.lecturePayRateNormal,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'ปริญญาตรี ต่อเนื่อง',
      degree: Degree.BACHELOR_CONTINUE,
      payRate: setting.lecturePayRateNormal,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'ปริญญาตรี นานาชาติ',
      degree: Degree.BACHELOR_INTER,
      payRate: setting.lecturePayRateInter,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'บัณฑิต ทั่วไป',
      degree: Degree.PUNDIT,
      payRate: setting.lecturePayRateNormal,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'บัณฑิต นานาชาติ',
      degree: Degree.PUNDIT_INTER,
      payRate: setting.lecturePayRateInter,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
  ]

  // ===== Configue height & width =====
  excel.font('TH SarabunPSK').fontSize(14)
  excel.cell('A1').width(Excel.pxCol(46))
  excel.cell('B1').width(Excel.pxCol(115))
  excel.cell('F1').width(Excel.pxCol(80))
  excel.cell('H1').width(Excel.pxCol(72))
  excel.cell('I1').width(Excel.pxCol(72))
  excel.cell('J1').width(Excel.pxCol(35))
  excel.cell('L1').width(Excel.pxCol(35))
  excel.cell('N1').width(Excel.pxCol(30))
  excel.cell('O1').width(Excel.pxCol(30))
  excel.cell('P1').width(Excel.pxCol(30))
  excel.cell('Q1').width(Excel.pxCol(30))
  excel.cell('R1').width(Excel.pxCol(30))
  excel.cell('S1').width(Excel.pxCol(30))
  excel.cell('T1').width(Excel.pxCol(30))
  excel.cell('U1').width(Excel.pxCol(45))
  excel.cell('V1').width(Excel.pxCol(45))

  // ===== Title =====
  excel.cell('H1').value(`ใบเบิกค่าสอนพิเศษ (อาจารย์ภายนอก)`).align('left')
  excel.cell('A2').value(`ผู้สอน`).align('left')
  excel.cell('B2').value(`${teacher.title}${teacher.name}`).align('left')
  excel.cell('E2').value(`ตำแหน่ง อาจารย์พิเศษ/อาจารย์ภายนอก`).align('left')
  excel
    .cell('O2')
    .value(`ภาคการศึกษาที่ ${semester}/${academicYear}`)
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

  excel.cells('N3:T3').value(`เดือน${month}`).border('box').align('center')
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

  let currentDay: DayOfWeek | null = null
  const DayName = {
    [DayOfWeek.MONDAY]: 'จันทร์',
    [DayOfWeek.TUESDAY]: 'อังคาร',
    [DayOfWeek.WEDNESDAY]: 'พุธ',
    [DayOfWeek.THURSDAY]: 'พฤหัส',
    [DayOfWeek.FRIDAY]: 'ศุกร์',
    [DayOfWeek.SATURDAY]: 'เสาร์',
    [DayOfWeek.SUNDAY]: 'อาทิตย์',
  }

  const SubjectType = {
    [WorkloadType.LECTURE]: '(ท)',
    [WorkloadType.LAB]: '(ป)',
  }

  // ===== workload =====
  let remarkRow = Math.max(0, teacher.getWorkloadList().length - 3) + 11
  teacher.getWorkloadList().forEach((workload, index) => {
    const { subject, type, classYear, dayOfWeek } = workload

    excel
      .cells(`B${6 + index}:E${6 + index}`)
      .value(`${subject.code} ${subject.name} ${SubjectType[type]}`)
      .border('left', 'right')
      .align('left')
      .shrink()

    for (const time of workload.timeList) {
      // ===== Subject column =====

      if (dayOfWeek !== currentDay) {
        currentDay = workload.dayOfWeek
        excel
          .cell(`A${6 + index}`)
          .value(DayName[currentDay])
          .border('left', 'right')
          .align('center')
      }

      excel
        .cell(`F${6 + index}`)
        .value(subject.getFullCredit())
        .border('left', 'right')
        .align('center')

      excel
        .cell(`G${6 + index}`)
        .value(`ปี ${classYear} ${subject.curriculumCode}`)
        .border('left', 'right')
        .align('center')

      excel.cell(`H${6 + index}`).border('left', 'right')
      excel.cell(`I${6 + index}`).border('left', 'right')
      {
        const column = workload.type === WorkloadType.LECTURE ? 'H' : 'I'
        const startTime = Time.toTimeString(time.startSlot, '.')
        const endTime = Time.toTimeString(time.endSlot + 1, '.')
        excel
          .cell(`${column}${6 + index}`)
          .value(`${startTime}-${endTime}`)
          .align('center')
          .shrink()
      }

      const DegreeMapper = {
        [Degree.BACHELOR]: 'J',
        [Degree.BACHELOR_CONTINUE]: '',
        [Degree.BACHELOR_INTER]: 'K',
        [Degree.PUNDIT]: 'L',
        [Degree.PUNDIT_INTER]: 'M',
      }
      for (const col of Excel.range('J:M')) {
        const col2 = DegreeMapper[workload.degree]
        isClaimDegree[workload.degree] = true
        if (col === col2) {
          excel
            .cell(`${col}${6 + index}`)
            .value(subject.lectureHours)
            .border('left', 'right')
            .align('center')
        } else {
          excel
            .cell(`${col}${6 + index}`)
            .value('-')
            .border('left', 'right')
            .align('center')
        }
      }

      for (const col of Excel.range('N:V')) {
        excel.cell(`${col}${6 + index}`).border('left', 'right')
      }

      // ==== Render Week date
      const workloadBody = workloadList.find(
        (w) => w.workloadId === workload.subject.id
      )
      if (!workloadBody) {
        throw new NotFoundError('ไม่พบวิชาดังกล่าว', [
          `subject ${workload.subject.id} is not found`,
        ])
      }

      let dateCol = 'N'
      for (const day of workloadBody.dayList) {
        excel
          .cell(`${dateCol}${6 + index}`)
          .value(day.isCompensated ? `*${day.day}` : day.day)
          .align('center')
        dateCol = Excel.toAlphabet(Excel.toNumber(dateCol) + 1)

        if (day.isCompensated) {
          excel.cells(`J${remarkRow}:W${remarkRow}`).value(`*${day.remark}`)
          remarkRow++
        }
      }

      excel
        .cell(`U${6 + index}`)
        .value(workloadBody.dayList.length)
        .border('left', 'right')
        .align('center')

      const hr = subject.lectureHours * workloadBody.dayList.length

      excel
        .cell(`V${6 + index}`)
        .value(hr)
        .border('left', 'right')
        .align('center')

      excel
        .cell(`W${6 + index}`)
        .value(`เบิก ${subject.curriculumCode}`)
        .border('left', 'right')
        .align('center')

      // eslint-disable-next-line
      const summary = summaryClaim.find((sc) => sc.degree === workload.degree)!
      for (const time of workload.timeList) {
        let hoursUnit = (time.endSlot + 1 - time.startSlot) / 4
        if (workload.type === WorkloadType.LAB) hoursUnit /= 2

        const hr = hoursUnit * workloadBody.dayList.length

        summary.totalHours += hr
        summary.claimAmount += hr * summary.payRate
      }
    }
  })

  // ===== Least 3 rows =====
  let row = teacher.teacherWorkloadList.length + 6
  if (row < 9) {
    for (row; row < 9; row++) {
      excel.cell(`A${row}`).border('left', 'right')
      excel.cells(`B${row}:E${row}`).border('left', 'right')
      for (const col of Excel.range('F:W')) {
        excel.cell(`${col}${row}`).border('left', 'right')
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
  excel
    .cell(`A${row + 2}`)
    .value('รวมจำนวนหน่วยชั่วโมง/จำนวนเงิน ที่ขอเบิกต่อภาคการศึกษา')
    .align('left')
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

  // ===== degree title=====
  if (
    isClaimDegree[Degree.BACHELOR] === true ||
    isClaimDegree[Degree.BACHELOR_INTER] === true
  ) {
    excel.cell('I2').value(`☑ ปริญญาตรี`).align('left')
    excel.cell('L2').value(`⬜ บัณฑิตศึกษา`).align('left')
  } else {
    excel.cell('I2').value(`⬜ ปริญญาตรี`).align('left')
    excel.cell('L2').value(`☑ บัณฑิตศึกษา`).align('left')
  }

  {
    for (let i = 0; i <= 4; i++) {
      excel
        .cells(`A${row + 4 + i}:B${row + 4 + i}`)
        .value(`${summaryClaim[i].degreeThai}`)
        .border('box')
        .align('left')
    }
  }
  {
    for (let i = 4; i <= 8; i++) {
      for (const col of Excel.range('C:F')) {
        excel
          .cell(`${col}${row + i}`)
          .border('box')
          .align('center')
      }
      excel
        .cells(`G${row + i}:H${row + i}`)
        .border('box')
        .align('center')
    }
  }
  // ===== Render Claim summary ====
  if (isClaimDegree[Degree.BACHELOR] === true) {
    excel.cell(`C${row + 4}`).value(summaryClaim[0].totalHours)
    excel
      .cell(`D${row + 4}`)
      .value(summaryClaim[0].payRate)
      .numberFormat('#,##0')
    excel
      .cell(`E${row + 4}`)
      .value(summaryClaim[0].claimAmount)
      .numberFormat('#,##0')
    excel
      .cell(`G${row + 4}`)
      .value(summaryClaim[0].claimAmount)
      .numberFormat('#,##0')
  } else if (isClaimDegree[Degree.BACHELOR_CONTINUE] === true) {
    excel.cell(`C${row + 5}`).value(summaryClaim[1].totalHours)
    excel
      .cell(`D${row + 5}`)
      .value(summaryClaim[1].payRate)
      .numberFormat('#,##0')
    excel
      .cell(`E${row + 5}`)
      .value(summaryClaim[1].claimAmount)
      .numberFormat('#,##0')
    excel
      .cell(`G${row + 5}`)
      .value(summaryClaim[1].claimAmount)
      .numberFormat('#,##0')
  } else if (isClaimDegree[Degree.BACHELOR_INTER] === true) {
    excel.cell(`C${row + 6}`).value(summaryClaim[2].totalHours)
    excel
      .cell(`D${row + 6}`)
      .value(summaryClaim[2].payRate)
      .numberFormat('#,##0')
    excel
      .cell(`E${row + 6}`)
      .value(summaryClaim[2].claimAmount)
      .numberFormat('#,##0')
    excel
      .cell(`G${row + 6}`)
      .value(summaryClaim[2].claimAmount)
      .numberFormat('#,##0')
  } else if (isClaimDegree[Degree.PUNDIT] === true) {
    excel.cell(`C${row + 7}`).value(summaryClaim[3].totalHours)
    excel
      .cell(`D${row + 7}`)
      .value(summaryClaim[3].payRate)
      .numberFormat('#,##0')
    excel
      .cell(`E${row + 7}`)
      .value(summaryClaim[3].claimAmount)
      .numberFormat('#,##0')
    excel
      .cell(`G${row + 7}`)
      .value(summaryClaim[3].claimAmount)
      .numberFormat('#,##0')
  } else if (isClaimDegree[Degree.PUNDIT_INTER] === true) {
    excel.cell(`C${row + 8}`).value(summaryClaim[4].totalHours)
    excel
      .cell(`D${row + 8}`)
      .value(summaryClaim[4].payRate)
      .numberFormat('#,##0')
    excel
      .cell(`E${row + 8}`)
      .value(summaryClaim[4].claimAmount)
      .numberFormat('#,##0')
    excel
      .cell(`G${row + 8}`)
      .value(summaryClaim[4].claimAmount)
      .numberFormat('#,##0')
  }

  // ===== Claim Summary =====
  excel
    .cells(`A${row + 9}:B${row + 9}`)
    .value('รวม')
    .border('box')
    .align('center')
  excel
    .cells(`C${row + 9}:F${row + 9}`)
    .formula(`"("&BAHTTEXT(G${row + 9})&")"`)
    .border('box')
    .align('center')
  excel
    .cells(`G${row + 9}:H${row + 9}`)
    .formula(`SUM(G${row + 4}:H${row + 8})`)
    .border('box')
    .align('center')
    .numberFormat('#,##0')

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
    .cells(`P${row + 11}:V${row + 11}`)
    .value('ผู้อนุมัติ')
    .align('center')
  excel
    .cells(`P${row + 13}:V${row + 13}`)
    .value('...........................................')
    .align('center')
  excel
    .cells(`P${row + 14}:V${row + 14}`)
    .value(`(${setting.deanName})`)
    .align('center')
  excel
    .cells(`P${row + 15}:V${row + 15}`)
    .value('คณบดีคณะวิศวกรรมศาสตร์')
    .align('center')
}

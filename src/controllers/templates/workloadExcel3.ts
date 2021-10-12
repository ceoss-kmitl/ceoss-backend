import { Excel, PaperSize } from '@libs/Excel'
import { mapTimeSlotToTime } from '@libs/mapper'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { DayOfWeek, WorkloadType, Degree } from '@models/workload'

// CEPP, PROJECT1, PROJECT2
const FILTERED_SUBJECT = ['01076014', '01076311', '01076312']

const REMARK_CLAIM = ['FE', 'SE', 'CIE']

const INTER_CLAIM_ORDER = ['CIE', 'SE']

export async function generateWorkloadExcel3(
  excel: Excel,
  teacher: Teacher,
  academicYear: number,
  semester: number
) {
  teacher.teacherWorkloadList = teacher
    .filterTeacherWorkloadList({
      academicYear,
      semester,
    })
    .filter(
      (tw) => !FILTERED_SUBJECT.includes(tw.workload.subject.code) && tw.isClaim
    )
    .sort(
      (a, b) =>
        a.workload.dayOfWeek - b.workload.dayOfWeek ||
        a.workload.getFirstTimeSlot() - b.workload.getFirstTimeSlot()
    )

  const setting = await Setting.get()

  // ===== Excel setup =====
  excel.addSheet('03-ใบเบิกค่าสอน', {
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

  // Variable to check which degree has claimed
  const isClaimDegree = {
    [Degree.Bachelor]: false,
    [Degree.BachelorCon]: false,
    [Degree.BachelorInter]: false,
    [Degree.Pundit]: false,
    [Degree.PunditInter]: false,
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
      degree: Degree.Bachelor,
      payRate: setting.lecturePayRateNormal,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'ปริญญาตรี ต่อเนื่อง',
      degree: Degree.BachelorCon,
      payRate: setting.lecturePayRateNormal,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'ปริญญาตรี นานาชาติ',
      degree: Degree.BachelorInter,
      payRate: setting.lecturePayRateInter,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'บัณฑิต ทั่วไป',
      degree: Degree.Pundit,
      payRate: setting.lecturePayRateNormal,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
    {
      degreeThai: 'บัณฑิต นานาชาติ',
      degree: Degree.PunditInter,
      payRate: setting.lecturePayRateInter,
      totalHours: 0,
      claimAmount: 0,
      subList: [],
    },
  ]

  // For render at the top right of file only
  const WORKLOAD_HOURS = teacher.executiveRole ? 75 : 150

  // For calculation
  const WORKLOAD_HOURS_THESHOLD = 150

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
  excel.cells('F2:K2').value(`ตำแหน่งบริหาร ${teacher.executiveRole}`).shrink()

  // ===== Title - Checkbox =====
  excel.cells('M2:O2').value('⬜ ข้าราชการ')
  excel.cells('Q2:S2').value('☑ ปริญญาตรี')
  excel.cells('M3:O3').value('☑ พนักงานสถาบันฯ')
  excel.cells('Q3:S3').value('⬜ บัณฑิตศึกษา')
  excel.cells('U2:X2').value(`ภาคการศึกษาที่ ${semester}/${academicYear}`)
  excel.cells('U3:V3').value('ภาระงานสอน')
  excel.cell('W3').value(WORKLOAD_HOURS).align('center')
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
      excel.cell(`G${currentRow}`).border('box').align('center').shrink()

      if (subject.code.startsWith('90')) {
        excel.value(`${section}`)
      } else if (subject.code === '01006028') {
        excel.value(`ปี ${classYear}`)
      } else {
        excel.value(`ปี ${classYear} ${fieldOfStudy}/${section}`)
      }

      // Render time
      excel.cell(`H${currentRow}`).border('box')
      excel.cell(`I${currentRow}`).border('box')
      {
        const column = workload.type === WorkloadType.Lecture ? 'H' : 'I'
        const startTime = mapTimeSlotToTime(time.startSlot, '.')
        const endTime = mapTimeSlotToTime(time.endSlot + 1, '.')
        excel
          .cell(`${column}${currentRow}`)
          .value(`${startTime}-${endTime}`)
          .align('center')
          .shrink()
      }

      // Render hours per week
      for (const col of Excel.range('J:Y')) {
        excel.cell(`${col}${currentRow}`).border('box').align('center')
      }
      let hoursUnit = (time.endSlot + 1 - time.startSlot) / 4
      if (workload.type === WorkloadType.Lab) hoursUnit /= 2
      const DegreeMapper = {
        [Degree.Bachelor]: 'JKL',
        [Degree.BachelorCon]: 'MNO',
        [Degree.BachelorInter]: 'PQR',
        [Degree.Pundit]: 'STU',
        [Degree.PunditInter]: 'VWX',
      }
      {
        const col = DegreeMapper[workload.degree]
        isClaimDegree[workload.degree] = true

        excel.cell(`${col[0]}${currentRow}`).value(hoursUnit)
        excel
          .cell(`${col[1]}${currentRow}`)
          .value(teacher.getWeekCount(workload.id))
        excel
          .cell(`${col[2]}${currentRow}`)
          .formula(`${col[0]}${currentRow}*${col[1]}${currentRow}`)

        // Store total hours in summaryClaim
        {
          const hr = hoursUnit * teacher.getWeekCount(workload.id)
          const summaryIndex = summaryClaim.findIndex(
            (sc) => sc.degree === workload.degree
          )

          // Inter degree
          if (subject.isInter) {
            const subIndex = summaryClaim[summaryIndex].subList.findIndex(
              (sub) => sub.fieldOfStudy === fieldOfStudy
            )
            if (subIndex === -1) {
              summaryClaim[summaryIndex].subList.push({
                degree: workload.degree,
                degreeThai: `${
                  workload.degree === Degree.BachelorInter
                    ? 'ปริญญาตรี'
                    : 'บัณฑิต'
                } นานาชาติ ${workload.fieldOfStudy}`,
                payRate: setting.lecturePayRateInter,
                totalHours: hr,
                fieldOfStudy: workload.fieldOfStudy,
                claimAmount: 0,
              })
            } else {
              summaryClaim[summaryIndex].subList[subIndex].totalHours += hr
            }
          }
          // Normal degree
          else {
            summaryClaim[summaryIndex].totalHours += hr
          }
        }

        // Render remark (หมายเหตุ)
        if (REMARK_CLAIM.includes(fieldOfStudy)) {
          excel
            .cell(`Y${currentRow}`)
            .value(`เบิก ${workload.fieldOfStudy}`)
            .align('center')
            .shrink()
        }
      }

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

  // Border every cell in row
  for (const col of Excel.range('F:Y')) {
    excel.cell(`${col}${currentRow}`).border('box', 'top-bold').align('center')
  }

  // Calculate hours summary each of degree
  for (const [degree, col] of [
    [Degree.Bachelor, 'L'],
    [Degree.BachelorCon, 'O'],
    [Degree.BachelorInter, 'R'],
    [Degree.Pundit, 'U'],
    [Degree.PunditInter, 'X'],
  ]) {
    if (isClaimDegree[degree as Degree]) {
      excel
        .cell(`${col}${currentRow}`)
        .formula(`SUM(${col}7:${col}${currentRow - 1})`)
    }
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

  // Border every cell in row
  for (const col of Excel.range('F:Y')) {
    excel.cell(`${col}${currentRow}`).border('box').align('center')
  }

  // Calculate
  for (const [degree, col] of [
    [Degree.Bachelor, 'L'],
    [Degree.BachelorCon, 'O'],
    [Degree.BachelorInter, 'R'],
    [Degree.Pundit, 'U'],
    [Degree.PunditInter, 'X'],
  ]) {
    if (isClaimDegree[degree as Degree]) {
      // IF inter ignore 150 hrs threshold
      if (
        [Degree.BachelorInter, Degree.PunditInter].includes(degree as Degree)
      ) {
        excel.cell(`${col}${currentRow}`).value(0)
      }
      // IF normal calculate 150 hrs threshold
      else {
        excel
          .cell(`${col}${currentRow}`)
          .formula(
            `IF(${col}${currentRow - 1}<${WORKLOAD_HOURS_THESHOLD},${col}${
              currentRow - 1
            },${WORKLOAD_HOURS_THESHOLD})`
          )
      }
    }
  }
  currentRow++

  // ===== Render table footer - row 3 =====
  excel.cell(`A${currentRow}`).border('left', 'top', 'bottom-double')
  excel
    .cells(`B${currentRow}:E${currentRow}`)
    .value('จำนวนหน่วยชั่วโมงที่เบิกได้')
    .border('top', 'bottom-double')

  // Border every cell in row
  for (const col of Excel.range('F:Y')) {
    excel
      .cell(`${col}${currentRow}`)
      .border('box', 'bottom-double')
      .align('center')
  }
  // Calculate
  for (const [degree, col] of [
    [Degree.Bachelor, 'L'],
    [Degree.BachelorCon, 'O'],
    [Degree.BachelorInter, 'R'],
    [Degree.Pundit, 'U'],
    [Degree.PunditInter, 'X'],
  ]) {
    if (isClaimDegree[degree as Degree]) {
      excel
        .cell(`${col}${currentRow}`)
        .formula(`${col}${currentRow - 2}-${col}${currentRow - 1}`)
    }
  }

  // ===== Render bottom table
  {
    const lastTableRow = currentRow
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

    // Sort inter claim order
    summaryClaim.forEach((sc) => {
      sc.subList.sort(
        (a, b) =>
          INTER_CLAIM_ORDER.indexOf(a.fieldOfStudy) -
          INTER_CLAIM_ORDER.indexOf(b.fieldOfStudy)
      )
    })

    // Render degree
    let order = 1
    let interClaimRemaining = setting.interClaimLimit
    summaryClaim.forEach((summary) => {
      // Inter row summary
      if (
        [Degree.BachelorInter, Degree.PunditInter].includes(summary.degree) &&
        summary.subList.length
      ) {
        summary.subList.forEach((sub) => {
          // Draw outline
          excel.cells(`F${row}:G${row}`).border('box')
          for (const col of Excel.range('C:F')) {
            excel.cell(`${col}${row}`).border('box').align('center')
          }

          excel
            .cells(`A${row}:B${row}`)
            .value(`${order}. ${sub.degreeThai}`)
            .border('box')
          if (sub.totalHours) {
            const tmpClaimAmount = Math.max(
              0,
              Math.min(sub.totalHours * sub.payRate, interClaimRemaining)
            )
            excel.cell(`C${row}`).value(sub.totalHours)
            excel.cell(`D${row}`).value(sub.payRate).numberFormat('#,##0')
            excel
              .cell(`E${row}`)
              .formula(`C${row}*D${row}`)
              .numberFormat('#,##0')
            excel.cell(`F${row}`).value(tmpClaimAmount).numberFormat('#,##0')
            interClaimRemaining -= tmpClaimAmount
          }
          order++
          row++
        })
      }
      // Normal row summary
      else {
        // Draw outline
        excel.cells(`F${row}:G${row}`).border('box')
        for (const col of Excel.range('C:F')) {
          excel.cell(`${col}${row}`).border('box').align('center')
        }

        excel
          .cells(`A${row}:B${row}`)
          .value(`${order}. ${summary.degreeThai}`)
          .border('box')

        const claimAmount = Math.max(
          0,
          summary.totalHours - WORKLOAD_HOURS_THESHOLD
        )
        if (claimAmount) {
          excel.cell(`C${row}`).value(claimAmount)
          excel.cell(`D${row}`).value(summary.payRate).numberFormat('#,##0')
          excel.cell(`E${row}`).formula(`C${row}*D${row}`).numberFormat('#,##0')
          excel.cell(`F${row}`).formula(`E${row}`).numberFormat('#,##0')
        }
        order++
        row++
      }
    })

    // Last row: Total
    excel.cell(`A${row}`).value('รวม').border('box')
    excel
      .cells(`B${row}:D${row}`)
      .formula(`"("&BAHTTEXT(F${row})&")"`)
      .border('box')
      .align('center')
    excel
      .cell(`E${row}`)
      .border('box')
      .align('center')
      .formula(`SUM(E${lastTableRow + 4}:E${row - 1})`)
      .numberFormat('#,##0')
    excel
      .cells(`F${row}:G${row}`)
      .border('box')
      .align('center')
      .formula(`SUM(F${lastTableRow + 4}:F${row - 1})`)
      .numberFormat('#,##0')
  }

  // ===== Sign area =====
  {
    const hasInterClaim =
      isClaimDegree[Degree.BachelorInter] || isClaimDegree[Degree.PunditInter]
    const row = currentRow + 4

    if (hasInterClaim) {
      // #1
      excel
        .cells(`H${row}:K${row}`)
        .value('ขอรับรองว่ามีการเรียนการสอนตามที่เบิก-จ่าย')
        .align('center')
        .shrink()
      excel
        .cells(`H${row + 3}:J${row + 3}`)
        .value('……………………………..………..')
        .align('center')
      excel
        .cells(`H${row + 4}:K${row + 4}`)
        .value(`(${teacher.getFullName()})`)
        .align('center')
        .shrink()
      excel
        .cells(`H${row + 5}:K${row + 5}`)
        .value('ผู้เบิก/ผู้สอน')
        .align('center')

      // #2
      excel
        .cells(`L${row}:P${row}`)
        .value('ตรวจสอบแล้วมีการเรียนการสอนตามที่เบิก-จ่าย')
        .shrink()
      excel
        .cells(`L${row + 3}:O${row + 3}`)
        .value('……………………………………...')
        .align('center')
      excel
        .cells(`L${row + 4}:O${row + 4}`)
        .value(`(${setting.headName})`)
        .align('center')
        .shrink()
      excel
        .cells(`L${row + 5}:O${row + 5}`)
        .value('หัวหน้าภาค')
        .align('center')

      // #3
      excel
        .cells(`Q${row}:U${row}`)
        .value('ตรวจสอบแล้วมีการสอนตามที่เบิก-จ่าย')
        .align('center')
      excel
        .cells(`Q${row + 3}:T${row + 3}`)
        .value('……………………………………..')
        .align('center')
      excel
        .cells(`Q${row + 4}:T${row + 4}`)
        .value(`(${setting.directorSIIEName})`)
        .align('center')
        .shrink()
      excel
        .cells(`Q${row + 5}:T${row + 5}`)
        .value('ผู้อำนวยการ SIIE')
        .align('center')

      // #4
      excel.cells(`W${row}:X${row}`).value('ผู้อนุมัติ').align('center')
      excel
        .cells(`V${row + 3}:Y${row + 3}`)
        .value('……………………………………..')
        .align('center')
      excel
        .cells(`V${row + 4}:Y${row + 4}`)
        .value(`(${setting.deanName})`)
        .align('center')
        .shrink()
      excel
        .cells(`V${row + 5}:Y${row + 5}`)
        .value('คณบดีคณะวิศวกรรมศาสตร์')
        .align('center')
    } else {
      // #1
      excel
        .cells(`H${row}:L${row}`)
        .value('ขอรับรองว่ามีการเรียนการสอนตามที่เบิก-จ่าย')
        .align('center')
      excel
        .cells(`H${row + 3}:J${row + 3}`)
        .value('……………………………..………..')
        .align('center')
      excel
        .cells(`H${row + 4}:K${row + 4}`)
        .value(`(${teacher.getFullName()})`)
        .align('center')
        .shrink()
      excel
        .cells(`H${row + 5}:K${row + 5}`)
        .value('ผู้เบิก/ผู้สอน')
        .align('center')

      // #2
      excel
        .cells(`N${row}:T${row}`)
        .value('ตรวจสอบแล้วมีการเรียนการสอนตามที่เบิก-จ่าย')
      excel
        .cells(`O${row + 3}:R${row + 3}`)
        .value('……………………………………...')
        .align('center')
      excel
        .cells(`O${row + 4}:R${row + 4}`)
        .value(`(${setting.headName})`)
        .align('center')
        .shrink()
      excel
        .cells(`O${row + 5}:R${row + 5}`)
        .value('หัวหน้าภาค')
        .align('center')

      // #3
      excel.cells(`V${row}:W${row}`).value('ผู้อนุมัติ').align('center')
      excel
        .cells(`U${row + 3}:Y${row + 3}`)
        .value('……………………………………..')
        .align('center')
      excel
        .cells(`U${row + 4}:Y${row + 4}`)
        .value(`(${setting.deanName})`)
        .align('center')
        .shrink()
      excel
        .cells(`U${row + 5}:Y${row + 5}`)
        .value('คณบดีคณะวิศวกรรมศาสตร์')
        .align('center')
    }
  }
}

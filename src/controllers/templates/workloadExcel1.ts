import { Excel, PaperSize } from 'libs/Excel'
import { Teacher } from 'models/teacher'
import { Setting } from 'models/setting'
import { WorkloadType } from 'models/workload'
import { TeacherWorkload } from 'models/teacherWorkload'

export async function generateWorkloadExcel1(
  excel: Excel,
  teacher: Teacher,
  academicYear: number,
  semester: number
) {
  // Start: Prepare workload for rendering
  teacher.teacherWorkloadList = teacher
    .filterTeacherWorkloadList({
      academicYear,
      semester,
    })
    .sort(
      (a, b) =>
        a.workload.dayOfWeek - b.workload.dayOfWeek ||
        a.workload.getFirstTimeSlot() - b.workload.getFirstTimeSlot()
    )
    .reduce((prevList, cur) => {
      const prev = prevList.pop()
      if (!prev) return [cur]

      // Current workload OVERLAP with previous workload
      if (
        prev.workload.dayOfWeek === cur.workload.dayOfWeek &&
        prev.workload.getLastTimeSlot() >= cur.workload.getFirstTimeSlot()
      ) {
        const tmp = []
        if (prev.isClaim) tmp.push(prev)
        if (cur.isClaim) tmp.push(cur)
        return [...prevList, ...tmp]
      }

      return [...prevList, prev, cur]
    }, [] as TeacherWorkload[])
  // End: Prepare workload for rendering

  const setting = await Setting.get()

  // ===== Excel setup =====
  excel.addSheet('01-ภาระงาน', {
    pageSetup: {
      paperSize: PaperSize.A4,
      orientation: 'landscape',
      verticalCentered: true,
      horizontalCentered: true,
      fitToPage: true,
      printArea: 'A1:BB32',
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
      defaultColWidth: Excel.pxCol(20),
      defaultRowHeight: Excel.pxRow(23),
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
    .align('center')
  excel
    .cells('A2:BB2')
    .value(
      `ชื่อ  ${teacher.title}${teacher.name}    ภาควิชาวิศวกรรมคอมพิวเตอร์       เวลาปฏิบัติราชการ  08.30 - 16.30`
    )
    .bold()
    .align('center')
  excel
    .cells('A3:BB3')
    .value(
      'งานที่สอนให้เขียนรหัสวิชา ชื่อวิชา เป็นการสอนแบบทฤษฎี(ท) หรือปฏิบัติ(ป) ชั้นปี ห้อง'
    )
    .bold()
    .align('center')

  // ===== Date-Time corner header =====
  excel.fontSize(8)
  excel.cell('A5').value('เวลา').border('left', 'top').align('right')
  excel.cell('B5').border('top', 'right', 'diagonal-up')
  excel.cell('A6').border('left', 'bottom', 'diagonal-up')
  excel.cell('B6').value('วัน').border('right', 'bottom').align('left')
  excel.cell('C5').value('ชม.').border('box').align('center')
  excel.cell('C6').value('นาที').border('box').align('center')

  // ===== Time hours header ====
  excel.fontSize(12)
  {
    let hours = 8
    for (const range of ['D5:G5', 'H5:K5', 'L5:O5', 'P5:S5']) {
      excel
        .cells(range)
        .value(hours++)
        .border('box')
        .align('center')
    }
  }
  excel.cells('T5:V5').value('12.00').border('box').align('center')
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
        .align('center')
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
        .align('center')
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
        .align('center')
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
        .align('center')
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
    excel.cells(range).value(name).border('box').align('center')
  }

  // ===== Border all time slot =====
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

  // ===== Workload of teacher =====
  excel.fontSize(13)
  teacher.getWorkloadList().forEach((workload) => {
    const {
      subject,
      type,
      section,
      dayOfWeek,
      timeList,
      classYear,
      fieldOfStudy,
    } = workload

    const subjectType = {
      [WorkloadType.Lecture]: '(ท)',
      [WorkloadType.Lab]: '(ป)',
    }

    const row = 7 + (dayOfWeek - 1) * 2
    for (let i = 0; i < timeList.length; i++) {
      let start = Excel.toAlphabet(3 + (timeList[i].startSlot - 1))
      let end = Excel.toAlphabet(3 + (timeList[i].endSlot - 1))

      // Remove 1 slot because Lunch break have only 3 slot
      if (Excel.toNumber(start) >= 23) {
        start = Excel.toAlphabet(Excel.toNumber(start) - 1)
      }
      if (Excel.toNumber(end) >= 23) {
        end = Excel.toAlphabet(Excel.toNumber(end) - 1)
      }

      excel
        .cells(`${start}${row}:${end}${row}`)
        .value(
          `${subject.code} ${
            subjectType[type]
          } ปี ${classYear} ห้อง ${fieldOfStudy}/${section}${
            teacher.getIsClaim(workload.id) ? '' : ' ไม่เบิก'
          }`
        )
        .align('center')
        .shrink()
      excel
        .cells(`${start}${row + 1}:${end}${row + 1}`)
        .value(subject.name)
        .align('center')
        .shrink()

      if (timeList[i + 1]?.startSlot - timeList[i]?.endSlot === 2) {
        const breakTime = Excel.toAlphabet(Excel.toNumber(end) + 1)
        excel
          .cells(`${breakTime}${row}:${breakTime}${row + 1}`)
          .value(' พั ก เ บ ร ค ')
          .shrink()
          .align('center')
          .rotate(90)
      }
    }
  })

  // ===== Project table =====
  for (const col of [
    'A:D ลำดับ',
    'E:S เรื่อง',
    'T:AD รายชื่อนักศึกษา',
    'AE:AG ระดับ',
  ]) {
    const [range, name] = col.split(' ')
    const [start, end] = range.split(':')
    const row = 22
    excel
      .fontSize(10)
      .cells(`${start}${row}:${end}${row}`)
      .value(name)
      .border('box')
      .align('center')
    for (let i = 1; i <= 4; i++) {
      excel
        .fontSize(14)
        .cells(`${start}${row + i}:${end}${row + i}`)
        .border('box')
        .align('center')
    }
  }

  // ===== Other special work =====
  excel.fontSize(10).cells('AK22:BA22').value('ตำแหน่งและงานพิเศษอื่น')
  for (let i = 0; i < 3; i++) {
    const row = 23 + i
    excel
      .fontSize(10)
      .cell(`AK${row}`)
      .value(`${i + 1}.`)
    excel.fontSize(14).cells(`AL${row}:BA${row}`).border('bottom')
  }
  excel.fontSize(10).cells(`AK26:AL26`).value('อื่นๆ')
  excel.fontSize(14).cells('AM26:BA26').border('bottom')

  // ===== Sign area =====
  excel.fontSize(14)
  excel.cells('A28:BB28').value('รายละเอียดข้างบนถูกต้อง').align('center')
  excel
    .cells('E30:P30')
    .value('ลงชื่อ ...........................................')
    .align('center')
  excel
    .cells('F31:O31')
    .value(`(${teacher.title}${teacher.name})`)
    .align('center')
  excel.cells('F32:O32').value('ผู้จัดทำ/ผู้สอน').align('center')
  excel
    .cells('V30:AG30')
    .value('ลงชื่อ ...........................................')
    .align('center')
  excel.cells('W31:AF31').value(`(${setting.headName})`).align('center')
  excel.cells('W32:AF32').value('หัวหน้าภาค').align('center')
  excel
    .cells('AM30:AX30')
    .value('ลงชื่อ ...........................................ผู้อนุมัติ')
    .align('center')
  excel.cells('AN31:AW31').value(`(${setting.deanName})`).align('center')
  excel.cells('AN32:AW32').value('คณบดีคณะวิศวกรรมศาสตร์').align('center')
}

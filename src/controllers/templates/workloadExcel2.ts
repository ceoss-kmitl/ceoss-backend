import { Excel, PaperSize } from 'libs/Excel'
import { Teacher } from 'models/teacher'
import { Setting } from 'models/setting'
import { WorkloadType } from 'models/workload'

export async function generateWorkloadExcel2(
  excel: Excel,
  teacher: Teacher,
  academicYear: number,
  semester: number
) {
  teacher.teacherWorkloadList = teacher.filterTeacherWorkloadList({
    academicYear,
    semester,
  })

  const setting = await Setting.get()

  let claimInter = false

  // ===== Excel setup =====
  excel.addSheet('02-บัญชีรายละเอียด', {
    pageSetup: {
      paperSize: PaperSize.A4,
      orientation: 'landscape',
      verticalCentered: true,
      horizontalCentered: true,
      fitToPage: true,
      printArea: 'A1:M25',
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
      defaultColWidth: Excel.pxCol(90),
      defaultRowHeight: Excel.pxRow(28),
    },
  })

  // ===== Title =====
  excel.font('TH SarabunPSK').fontSize(16)
  excel
    .cells('A1:M1')
    .value(
      `บัญชีรายละเอียดวิชาสอน ประจำภาคเรียนที่ ${semester}/${academicYear}`
    )
    .bold()
    .align('center')
  excel
    .cells('A2:M2')
    .value(`ภาควิชาวิศวกรรมคอมพิวเตอร์`)
    .bold()
    .align('center')
  excel
    .cells('A3:M3')
    .value(`คณะวิศวกรรมศาสตร์ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง`)
    .bold()
    .align('center')

  // ===== header ====
  excel.fontSize(16)
  excel.cells('A5:B6').value(`ชื่อผู้สอน`).bold().border('box').align('center')
  excel.cells('C5:I6').value(`วิชาที่สอน`).bold().border('box').align('center')
  excel
    .cells('J5:K6')
    .value(`ชั้นปีที่สอน/กลุ่ม`)
    .bold()
    .border('box')
    .align('center')
  excel.cell('L5').value(`อัตรา`).bold().border('top').align('center')
  excel.cell('L6').value(`ค่าสอน/ช.ม.`).bold().border('bottom').align('center')
  excel
    .cell('M5')
    .value(`จำนวน ชม.`)
    .bold()
    .border('left', 'right', 'top')
    .align('center')
  excel
    .cell('M6')
    .value(`ที่สอน/สัปดาห์`)
    .bold()
    .border('left', 'right', 'bottom')
    .align('center')

  // ===== Teacher column =====
  excel.fontSize(15.5)
  excel
    .cells('A7:B7')
    .value(`${teacher.title}${teacher.name}`)
    .border('left', 'right')
    .align('center')

  for (let index = 0; index < teacher.getWorkloadList().length - 1; index++) {
    excel.cells(`A${8 + index}:B${8 + index}`).border('right', 'left')
  }

  // ===== workload =====
  teacher.getWorkloadList().forEach((workload, index) => {
    const { subject, type, section, classYear, fieldOfStudy } = workload

    const subjectType = {
      [WorkloadType.Lecture]: '(ท)',
      [WorkloadType.Lab]: '(ป)',
    }

    // ===== Subject column =====
    const isSubjectClaim = teacher.getIsClaim(workload.id)
    excel
      .cells(`C${7 + index}:I${7 + index}`)
      .value(
        ` - ${subject.code} ${subject.name} ${subjectType[type]} ${
          isSubjectClaim ? '' : ' ไม่เบิก'
        }`
      )
      .border('right', 'left')
      .align('left')

    if (subject.isInter === false) {
      excel
        .cells(`J${7 + index}:K${7 + index}`)
        .value(`${classYear}${fieldOfStudy}/${section}`)
        .border('right', 'left')
        .align('center')
    } else {
      excel
        .cells(`J${7 + index}:K${7 + index}`)
        .value(
          `${classYear}${subject.curriculumCode}/${section} (นานาชาติ ${subject.curriculumCode})`
        )
        .border('right', 'left')
        .align('center')
    }

    // ===== Pay rate and hour =====
    let payRate = 0
    if (subject.isInter === false) {
      if (type === 'LAB') payRate = setting.labPayRateNormal
      else payRate = setting.lecturePayRateNormal
    } else {
      claimInter = true
      if (type === 'LAB') payRate = setting.labPayRateInter
      else payRate = setting.lecturePayRateInter
    }

    excel
      .cell(`L${7 + index}`)
      .value(isSubjectClaim ? payRate : '-')
      .border('right')
      .align(isSubjectClaim ? 'right' : 'center')
      .numberFormat('0.00?')

    const teacherCount = workload.getTeacherList().length
    const hoursCount =
      (type === 'LAB' ? subject.labHours : subject.lectureHours) / teacherCount
    excel
      .cell(`M${7 + index}`)
      .value(hoursCount)
      .border('right')
      .align('right')
      .numberFormat('0.00?')
  })

  // ===== Least 11 rows =====

  let row = teacher.getWorkloadList().length + 7
  if (row < 18) {
    for (row; row < 18; row++) {
      excel.cells(`A${row}:B${row}`).border('right', 'left')
      excel.cells(`C${row}:I${row}`).border('right')
      excel.cells(`J${row}:K${row}`).border('right')
      excel.cell(`L${row}`).border('right')
      excel.cell(`M${row}`).border('right')
    }
  }

  // ===== Summary =====

  excel
    .cells(`A${row}:L${row}`)
    .value(`รวมจำนวนชม.ที่สอนทั้งหมด/สัปดาห์`)
    .border('top')
    .align('right')

  excel
    .cell(`M${row}`)
    .formula(`SUM(M7:M${row - 1})`)
    .numberFormat('0.00?')
    .border('box')
    .align('right')

  // ===== Sign area Teacher =====
  excel
    .cells(`D${row + 2}:E${row + 2}`)
    .value(`1.ตรวจสอบความถูกต้องแล้ว`)
    .border('left', 'right', 'top')
    .align('center')
  for (let i = 3; i < 6; i++) {
    excel.cell(`D${row + i}`).border('left')
    excel.cell(`E${row + i}`).border('right')
    excel.cell(`F${row + i}`).border('left')
    excel.cell(`G${row + i}`).border('right')
    excel.cell(`H${row + i}`).border('left')
    excel.cell(`I${row + i}`).border('right')
    excel.cell(`J${row + i}`).border('left')
    excel.cell(`K${row + i}`).border('right')
  }
  excel
    .cells(`D${row + 6}:E${row + 6}`)
    .value(`(${teacher.title}${teacher.name})`)
    .border('left', 'right')
    .align('center')
  excel
    .cells(`D${row + 7}:E${row + 7}`)
    .value(`ผู้จัดทำ/ผู้สอน`)
    .border('left', 'right', 'bottom')
    .align('center')

  // ===== Sign area Head =====
  excel
    .cells(`F${row + 2}:G${row + 2}`)
    .value(`2.ตรวจสอบความถูกต้องแล้ว`)
    .border('left', 'right', 'top')
    .align('center')
  excel
    .cells(`F${row + 6}:G${row + 6}`)
    .value(`(${setting.headName})`)
    .border('left', 'right')
    .align('center')
  excel
    .cells(`F${row + 7}:G${row + 7}`)
    .value(`หัวหน้าภาค`)
    .border('left', 'right', 'bottom')
    .align('center')

  // ===== Sign area sub dean =====

  if (claimInter == false) {
    excel
      .cells(`H${row + 2}:I${row + 2}`)
      .value(`3.ตรวจสอบความถูกต้องแล้ว`)
      .border('left', 'right', 'top')
      .align('center')
    excel
      .cells(`H${row + 6}:I${row + 6}`)
      .value(`(${setting.viceDeanName})`)
      .border('left', 'right')
      .align('center')
    excel
      .cells(`H${row + 7}:I${row + 7}`)
      .value(`รองคณบดี/ผู้ตรวจ`)
      .border('left', 'right', 'bottom')
      .align('center')
  } else {
    excel
      .cells(`H${row + 2}:I${row + 2}`)
      .value(`3.ตรวจสอบความถูกต้องแล้ว`)
      .border('left', 'right', 'top')
      .align('center')
    excel
      .cells(`H${row + 6}:I${row + 6}`)
      .value(`(${setting.directorSIIEName})`)
      .border('left', 'right')
      .align('center')
    excel
      .cells(`H${row + 7}:I${row + 7}`)
      .value(`ผู้อำนวยการ SIIE`)
      .border('left', 'right', 'bottom')
      .align('center')
  }

  // ===== Sign area dean =====
  excel
    .cells(`J${row + 2}:K${row + 2}`)
    .value(`4.อนุมัติ`)
    .border('left', 'right', 'top')
    .align('center')
  excel
    .cells(`J${row + 6}:K${row + 6}`)
    .value(`(${setting.deanName})`)
    .border('left', 'right')
    .align('center')
  excel
    .cells(`J${row + 7}:K${row + 7}`)
    .value(`คณบดีคณะวิศวกรรมศาสตร์`)
    .border('left', 'right', 'bottom')
    .align('center')
}

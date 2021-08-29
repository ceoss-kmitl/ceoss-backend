import { Response } from 'express'
import { Excel, PaperSize } from '@libs/Excel'
import { IGetWorkloadExcel2Query } from '@controllers/types/workload'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { WorkloadType } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'

const NOT_CLAIM_SUBJECT = ['']

export async function generateWorkloadExcel2(
  response: Response,
  query: IGetWorkloadExcel2Query
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
      margins: {
        top: 0.35,
        bottom: 0.1,
        left: 0.16,
        right: 0,
        header: 0.32,
        footer: 0.32,
      },
    },
    views: [{ style: 'pageLayout' }],
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
      `บัญชีรายละเอียดวิชาสอน ประจำภาคเรียนที่ ${semester}/${academic_year}`
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

  // ===== workload =====
  teacher.workloadList.forEach((workload) => {
    const { subject, type, section, classYear, fieldOfStudy } = workload

    const subjectType = {
      [WorkloadType.Lecture]: '(ท)',
      [WorkloadType.Lab]: '(ป)',
    }

    // ===== Subject column =====
    // question about not claim
    // how to print subject in each row still don't know
    excel
      .cells(`C7:I7`)
      .value(
        ` - ${subject.code} ${subject.name} ${subjectType[type]} ${
          NOT_CLAIM_SUBJECT.includes(subject.code) ? ' ไม่เบิก' : ''
        }`
      )
      .border('right', 'left')
      .align('left')

    // ===== class year/section column =====
    excel
      .cells(`J7:K7`)
      .value(`${classYear}${fieldOfStudy}/${section}`)
      .border('right', 'left')
      .align('center')

    // ===== pay rate column =====
    // check not claim subject, subjectType and curriculum for get pay rate
    excel
      .cell(`L7`)
      .value(
        `${
          NOT_CLAIM_SUBJECT.includes(subject.code)
            ? '-'
            : `${setting.lecturePayRate}`
        }`
      )
      .border('right')
      .align('right')

    // ===== hour column =====
    // check subjectType for get hour
    excel.cell(`M7`).value(`${subject.credit}`).border('right').align('right')
  })

  // ===== summary =====
  // still can't calculate
  const row = 20
  excel
    .cells(`A${row + 1}:L${row + 1}`)
    .value(`รวมจำนวนชม.ที่สอนทั้งหมด/สัปดาห์`)
    .border('top')
    .align('right')

  excel
    .cells(`M${row + 1}`)
    .value(`ชั่วโมงรวม`)
    .border('box')
    .align('right')

  // ===== Sign area Teacher =====
  excel
    .cells(`D${row + 3}:E${row + 3}`)
    .value(`1.ตรวจสอบความถูกต้องแล้ว`)
    .border('left', 'right', 'top')
    .align('center')
  for (let i = 4; i < 7; i++) {
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
    .cells(`D${row + 7}:E${row + 7}`)
    .value(`(${teacher.title}${teacher.name})`)
    .border('left', 'right')
    .align('center')
  excel
    .cells(`D${row + 8}:E${row + 8}`)
    .value(`ผู้จัดทำ/ผู้สอน`)
    .border('left', 'right', 'bottom')
    .align('center')

  // ===== Sign area Head =====
  excel
    .cells(`F${row + 3}:G${row + 3}`)
    .value(`2.ตรวจสอบความถูกต้องแล้ว`)
    .border('left', 'right', 'top')
    .align('center')
  excel
    .cells(`F${row + 7}:G${row + 7}`)
    .value(`(${setting.headName})`)
    .border('left', 'right')
    .align('center')
  excel
    .cells(`F${row + 8}:G${row + 8}`)
    .value(`หัวหน้าภาค`)
    .border('left', 'right', 'bottom')
    .align('center')

  // ===== Sign area sub dean =====
  excel
    .cells(`H${row + 3}:I${row + 3}`)
    .value(`3.ตรวจสอบความถูกต้องแล้ว`)
    .border('left', 'right', 'top')
    .align('center')
  excel
    .cells(`H${row + 7}:I${row + 7}`)
    .value(`(อ่าเอ่อ)`)
    .border('left', 'right')
    .align('center')
  excel
    .cells(`H${row + 8}:I${row + 8}`)
    .value(`รองคณบดี/ผู้ตรวจ`)
    .border('left', 'right', 'bottom')
    .align('center')

  // ===== Sign area dean =====
  excel
    .cells(`J${row + 3}:K${row + 3}`)
    .value(`4.อนุมัติ`)
    .border('left', 'right', 'top')
    .align('center')
  excel
    .cells(`J${row + 7}:K${row + 7}`)
    .value(`(${setting.deanName})`)
    .border('left', 'right')
    .align('center')
  excel
    .cells(`J${row + 8}:K${row + 8}`)
    .value(`คณบดีคณะวิศวกรรมศาสตร์`)
    .border('left', 'right', 'bottom')
    .align('center')

  return excel.createFile(
    `02_บัญชีรายละเอียด ${semester}-${String(academic_year).substr(
      2,
      2
    )} คอมพิวเตอร์-${teacher.name}`
  )
}

import { Response } from 'express'
import { Excel, PaperSize } from '@libs/Excel'
import { IGetWorkloadExcel2Query } from '@controllers/types/workload'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { WorkloadType } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'

const NOT_CLAIM_SUBJECT = ['']

// inter 01006(FE) 01266(CIE) 13016(SE)

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

    // for (let index = 0; index < teacher.workloadList.length - 1; index++) {
    //   excel.cells(`A${8 + index}:B${8 + index}`).border('right', 'left')
    // }

    // excel.cells(`C7:I7`).border('right', 'left')

    // ===== Subject column =====
    for (let index = 0; index < teacher.workloadList.length; index++) {
      const workload = teacher.workloadList[index]
      const subject = workload.subject
      // excel
      //   .cells(`C${7 + index}:I${7 + index}`)
      //   .value(
      //     ` - ${subject.code} ${subject.name} ${subjectType[type]} ${
      //       NOT_CLAIM_SUBJECT.includes(subject.code) ? ' ไม่เบิก' : ''
      //     }`
      //   )
      //   .border('right', 'left')
      //   .align('left')

      // excel
      //   .cells(`J${7 + index}:K${7 + index}`)
      //   .value(`${classYear}${fieldOfStudy}/${section}`)
      //   .border('right', 'left')
      //   .align('center')

      excel
        .cell(`L${7 + index}`)
        .value(
          `${
            NOT_CLAIM_SUBJECT.includes(subject.code)
              ? '-'
              : `${setting.lecturePayRateNormal}`
          }`
        )
        .border('right')
        .align('right')

      excel
        .cell(`M${7 + index}`)
        .value(
          `${type == 'LAB' ? `${subject.labHours}` : `${subject.lectureHours}`}`
        )
        .border('right')
        .align('right')
    }
  })

  let row = teacher.workloadList.length + 7
  if (row < 18) {
    for (row; row < 18; row++) {
      excel.cells(`A${row}:B${row}`).border('right', 'left')
      excel.cells(`C${row}:I${row}`).border('right')
      excel.cells(`J${row}:K${row}`).border('right')
      excel.cell(`L${row}`).border('right')
      excel.cell(`M${row}`).border('right')
    }
  }

  excel
    .cells(`A${row}:L${row}`)
    .value(`รวมจำนวนชม.ที่สอนทั้งหมด/สัปดาห์`)
    .border('top')
    .align('right')

  excel.cell(`M${row}`).value(`ชั่วโมงรวม`).border('box').align('right')

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
  // ===== Add condition =====
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

  return excel.createFile(
    `02_บัญชีรายละเอียด ${semester}-${String(academic_year).substr(
      2,
      2
    )} คอมพิวเตอร์-${teacher.name}`
  )
}
import { Response } from 'express'
import { Excel, PaperSize } from '@libs/Excel'
import { IGetWorkloadExcel2Query } from '@controllers/types/workload'
import { Teacher } from '@models/teacher'
// import { Setting } from '@models/setting'
import { NotFoundError } from '@errors/notFoundError'

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

  //   const setting = await Setting.get()

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

  return excel.createFile(
    `02_บัญชีรายละเอียด ${semester}-${String(academic_year).substr(
      2,
      2
    )} คอมพิวเตอร์-${teacher.name}`
  )
}

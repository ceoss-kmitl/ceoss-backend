import { Response } from 'express'
import { Excel, PaperSize } from '@libs/Excel'
// import { mapTimeSlotToTime } from '@libs/mapper'
import { IGetWorkloadExcel5Query } from '@controllers/types/workload'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
// import { DayOfWeek, WorkloadType, Degree } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'

// CEPP, PROJECT1, PROJECT2
// const FILTERED_SUBJECT = ['01076014', '01076311', '01076312']

// const REMARK_CLAIM = ['FE', 'SE', 'CIE']

// const INTER_CLAIM_ORDER = ['CIE', 'SE']

export async function generateWorkloadExcel5(
  response: Response,
  query: IGetWorkloadExcel5Query
) {
  const { teacher_id, academic_year, semester } = query

  const teacher = await Teacher.findOne(teacher_id, {
    relations: [
      'teacherWorkloadList',
      'teacherWorkloadList.teacher',
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
      printArea: 'A1:S22',
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
    .cells('A1:S1')
    .value(
      `หลักฐานการเบิกจ่ายเงินค่าสอนพิเศษและค่าสอนเกินภาระงานสอนในสถาบันอุดมศึกษา`
    )
    .bold()
    .align('center')
  excel
    .cells('A2:S2')
    .value(
      `ส่วนราชการ ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ ภาคการศึกษาที่ ${semester} พ.ศ. ${academic_year}`
    )
    .align('center')

  const row = 13

  // ===== Sign area =====
  excel
    .cells(`C${row + 1}:G${row + 1}`)
    .value('(15) ผู้อนุมัติ')
    .align('center')
    .border('top')
  excel
    .cells(`C${row + 3}:G${row + 3}`)
    .value('ลงชื่อ ...........................................')
    .align('center')
  excel
    .cells(`C${row + 4}:G${row + 4}`)
    .value(`(${setting.deanName})`)
    .align('center')
  excel
    .cells(`C${row + 5}:G${row + 5}`)
    .value('ตำแหน่ง คณบดีคณะวิศวกรรมศาสตร์')
    .align('center')
  excel
    .cells(`C${row + 6}:G${row + 6}`)
    .value('วันที่ ...........................................')
    .align('center')

  excel
    .cells(`K${row + 1}:O${row + 1}`)
    .value('(16) ผู้จ่ายเงิน')
    .align('center')
    .border('top')
  excel
    .cells(`K${row + 3}:O${row + 3}`)
    .value('ลงชื่อ ...........................................')
    .align('center')
  excel
    .cells(`K${row + 4}:O${row + 4}`)
    .value(`( ........................................... )`)
    .align('center')
  excel
    .cells(`K${row + 5}:O${row + 5}`)
    .value('ตำแหน่ง ...........................................')
    .align('center')
  excel
    .cells(`K${row + 6}:O${row + 6}`)
    .value('วันที่ ...........................................')
    .align('center')

  for (const col of Excel.range('A:S')) {
    excel.cell(`${col}${row + 7}`).border('top')
  }
  for (let i = 1; i < row + 7; i++) {
    excel.cell(`U${i}`).border('left')
  }

  return excel.createFile(
    `05_หลักฐาน ${semester}-${String(academic_year).substr(2, 2)} คอมพิวเตอร์`
  )
}

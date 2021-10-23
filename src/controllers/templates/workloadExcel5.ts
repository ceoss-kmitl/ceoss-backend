import { Excel, PaperSize } from '@libs/Excel'
import { mapTimeSlotToTime } from '@libs/mapper'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { DayOfWeek, WorkloadType, Degree } from '@models/workload'

// CEPP, PROJECT1, PROJECT2
// const FILTERED_SUBJECT = ['01076014', '01076311', '01076312']

// const REMARK_CLAIM = ['FE', 'SE', 'CIE']

// const INTER_CLAIM_ORDER = ['CIE', 'SE']

export async function generateWorkloadExcel5(
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
  .sort(
    (a, b) =>
      a.workload.dayOfWeek - b.workload.dayOfWeek ||
      a.workload.getFirstTimeSlot() - b.workload.getFirstTimeSlot()
  )

  const setting = await Setting.get()

  // ===== Excel setup =====
  excel.addSheet('05-หลักฐาน', {
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

  // ===== Configue font & width some column =====
  excel.font('TH SarabunPSK').fontSize(16)
  excel.cell('A1').width(Excel.pxCol(46))
  excel.cell('B1').width(Excel.pxCol(176))
  excel.cell('C1').width(Excel.pxCol(111))
  excel.cell('D1').width(Excel.pxCol(46))
  excel.cell('P1').width(Excel.pxCol(81))
  excel.cell('Q1').width(Excel.pxCol(46))
  excel.cell('R1').width(Excel.pxCol(46))
  excel.cell('S1').width(Excel.pxCol(46))
  // excel.cell('A3').width(Excel.pxRow(0))
  // excel.cell('A4').width(Excel.pxRow(119))
  // excel.cell('A3').width(Excel.pxRow(175))
  // excel.cell('A17').width(Excel.pxRow(55))
  // excel.cell('A18').width(Excel.pxRow(55))
  // excel.cell('A19').width(Excel.pxRow(55))

  // ===== Title =====
  excel
    .cells('A1:V1')
    .value(
      `หลักฐานการเบิกจ่ายเงินค่าสอนพิเศษและค่าสอนเกินภาระงานสอนในสถาบันอุดมศึกษา`
    )
    .bold()
    .align('center')
  excel
    .cells('A2:V2')
    .value(
      `ส่วนราชการ ภาควิชาวิศวกรรมคอมพิวเตอร์ คณะวิศวกรรมศาสตร์ ภาคการศึกษาที่ ${semester} พ.ศ. ${academicYear}`
    )
    .align('center')

  const row = 16

  // ===== Sign area =====
  excel
    .cells(`C${row + 1}:G${row + 1}`)
    .value('(15) ผู้อนุมัติ')
    .align('center')
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

  for (const col of Excel.range('A:V')) {
    excel.cell(`${col}${row + 7}`).border('top')
  }
  for (let i = 1; i < row + 7; i++) {
    excel.cell(`W${i}`).border('left')
  }
}

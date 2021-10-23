import { Excel, PaperSize } from '@libs/Excel'
import { Teacher } from '@models/teacher'
import { Setting } from '@models/setting'
import { Degree } from '@models/workload'

export async function generateWorkloadExcel5(
  excel: Excel,
  teacherList: Teacher[],
  academicYear: number,
  semester: number
) {
  const setting = await Setting.get()

  // Variable to check which degree has claimed
  const isClaimDegree = {
    [Degree.Bachelor]: false,
    [Degree.BachelorCon]: false,
    [Degree.BachelorInter]: false,
    [Degree.Pundit]: false,
    [Degree.PunditInter]: false,
  }

  const degree = [
    '1. ป.ตรี ทั่วไป/ต่อเนื่อง',
    '2. ป.ตรี นานาชาติ',
    '3. ป.โท-เอก ทั่วไป',
    '4. ป.โท-เอก นานาชาติ',
  ]

  for (let i = 0; i < teacherList.length; i++) {
    if (i % 10 === 0) {
      excel.addSheet('05-หลักฐาน', {
        pageSetup: {
          paperSize: PaperSize.A4,
          orientation: 'landscape',
          verticalCentered: true,
          horizontalCentered: true,
          fitToPage: true,
          printArea: 'A1:V22',
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
          defaultColWidth: Excel.pxCol(58),
          defaultRowHeight: Excel.pxRow(28),
        },
      })
    }

    // ===== Configue font & width some column =====
    excel.font('TH SarabunPSK').fontSize(16)
    excel.cell('A1').width(Excel.pxCol(46))
    excel.cell('B1').width(Excel.pxCol(176))
    excel.cell('C1').width(Excel.pxCol(111))
    excel.cell('D1').width(Excel.pxCol(46))
    excel.cell('S1').width(Excel.pxCol(81))
    excel.cell('T1').width(Excel.pxCol(46))
    excel.cell('U1').width(Excel.pxCol(46))
    excel.cell('V1').width(Excel.pxCol(46))
    excel.cell('A3').height(Excel.pxRow(0))
    excel.cell('A4').height(Excel.pxRow(116))
    excel.cell('A5').width(Excel.pxRow(109))
    excel.cell('A17').width(Excel.pxRow(55))
    excel.cell('A18').width(Excel.pxRow(55))
    excel.cell('A19').width(Excel.pxRow(55))

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

    // ===== header ====
    excel.cells('A4:A5').value('(3) ลำดับที่').border('box').align('center')
    excel
      .cells('B4:B5')
      .value('(4) ชื่อ - นามสกุล')
      .border('box')
      .align('center')
    excel
      .cells('C4:C5')
      .value('(5) ตำแหน่งผู้ทำการสอน')
      .border('box')
      .align('center')
    excel
      .cells('D4:D5')
      .value('(6) ได้รับเชิญให้สอน')
      .border('box')
      .align('center')
    excel.cells('E4:F4').value('(7) ระดับการสอน').border('box').align('center')
    excel
      .cells('G4:J4')
      .value('(8) จำนวนหน่วย ชม.ที่สอนพิเศษและสอนเกินภาระงานสอนแต่ละระดับ')
      .border('box')
      .align('center')
    excel
      .cells('K4:N4')
      .value('(9) จำนวนเงินที่เบิกได้แต่ละระดับ')
      .border('box')
      .align('center')
    excel
      .cells('O4:R4')
      .value('(10) จำนวนเงินที่ขอเบิกในแต่ละระดับ')
      .border('box')
      .align('center')
    excel
      .cells('S4:S5')
      .value('(11) จำนวนเงินรวมทั้ง ป.ตรี ต่อเนื่องและ ป.โท-เอก นานาชาติ')
      .border('box')
      .align('center')
    excel
      .cells('T4:T5')
      .value('(12) ลายมือชื่อผู้รับเงิน')
      .border('box')
      .align('center')
    excel
      .cells('U4:U5')
      .value('(13) วัน/เดือน/ปีที่รับเงิน')
      .border('box')
      .align('center')
    excel.cells('V4:V5').value('(14) หมายเหตุ').border('box').align('center')
    excel.cell('E5').value('ป.ตรีหรือเทียบเท่า').border('box').align('center')
    excel
      .cell('F5')
      .value('ป.โท-เอกหรือเทียบเท่า')
      .border('box')
      .align('center')

    let index = 0
    for (const col of Excel.range('G:R')) {
      if (index === 4) {
        index = 0
      }
      excel
        .cell(`${col}5`)
        .value(`${degree[index]}`)
        .border('box')
        .align('center')
      index++
    }

    // ===== DATA ====
    for (let i = 1; i <= 10; i++) {
      excel
        .cell(`A${i + 5}`)
        .value(`${i}`)
        .border('box')
        .align('center')
    }

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

    for (let i = 4; i < row + 7; i++) {
      excel.cell(`A${i}`).border('left')
    }

    for (let i = 4; i < row + 7; i++) {
      excel.cell(`W${i}`).border('left')
    }
  }
}

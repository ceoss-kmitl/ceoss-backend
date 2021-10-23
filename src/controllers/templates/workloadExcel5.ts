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
    '"ป.ตรี" & CHAR(10) & "ทั่วไป/" & CHAR(10) & "ต่อเนื่อง"',
    '"ป.ตรี" & CHAR(10) & "นานา" & CHAR(10) & "ชาติ"',
    '"ป.โท-" & CHAR(10) & "เอก"  & CHAR(10) & "ทั่วไป"',
    '"ป.โท-" & CHAR(10) & "เอก" & CHAR(10) & "นานาชาติ"',
  ]

  const TeacherTitle = {
    'รศ.ดร.': 'รองศาสตราจารย์',
    'ดร.': 'อาจารย์',
    'รศ.': 'รองศาสตราจารย์',
    'ผศ.ดร.': 'ผู้ช่วยศาสตราจารย์',
    'ผศ.': 'ผู้ช่วยศาสตราจารย์',
    'อ.': 'อาจารย์',
    '': 'อาจารย์',
  }

  for (
    let teacherIndex = 0;
    teacherIndex < teacherList.length;
    teacherIndex++
  ) {
    if (teacherIndex % 10 === 0) {
      excel.addSheet(`${teacherIndex / 10 + 1}`, {
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

      // ===== Configue font & width some column =====
      excel.font('TH SarabunPSK').fontSize(16)
      excel.cell('A1').width(Excel.pxCol(46))
      excel.cell('B1').width(Excel.pxCol(176))
      excel.cell('C1').width(Excel.pxCol(111))
      excel.cell('D1').width(Excel.pxCol(46))
      excel.cell('E1').width(Excel.pxCol(65))
      excel.cell('F1').width(Excel.pxCol(65))
      excel.cell('S1').width(Excel.pxCol(81))
      excel.cell('T1').width(Excel.pxCol(46))
      excel.cell('U1').width(Excel.pxCol(46))
      excel.cell('V1').width(Excel.pxCol(46))
      excel.cell('A3').height(Excel.pxRow(1))
      excel.cell('A4').height(Excel.pxRow(116))
      excel.cell('A5').height(Excel.pxRow(109))
      excel.cell('A17').height(Excel.pxRow(55))
      excel.cell('A18').height(Excel.pxRow(55))
      excel.cell('A19').height(Excel.pxRow(55))

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
      excel
        .cells('A4:A5')
        .formula('"(3)" & CHAR(10) & "ลำดับ" & CHAR(10) & "ที่"')
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('B4:B5')
        .value('(4) ชื่อ - นามสกุล')
        .border('box')
        .align('center', 'top')
      excel
        .cells('C4:C5')
        .formula('"(5)" & CHAR(10) & "ตำแหน่ง" & CHAR(10) & "ผู้ทำการสอน"')
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('D4:D5')
        .formula(
          `"(6) ได้" & CHAR(10) & "รับเชิญ" & CHAR(10) & "ให้" & CHAR(10) & "สอน"`
        )
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('E4:F4')
        .formula('"(7)" & CHAR(10) & "ระดับการสอน"')
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('G4:J4')
        .formula(
          '"(8) จำนวนหน่วย" & CHAR(10) & "ชม.ที่สอนพิเศษและสอนเกินภาระ" & CHAR(10) & "งานสอนแต่ละระดับ"'
        )
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('K4:N4')
        .formula('"(9) จำนวนเงินที่เบิก" & CHAR(10) & "ได้แต่ละระดับ"')
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('O4:R4')
        .formula('"(10) จำนวนเงินที่ขอ" & CHAR(10) & "เบิกในแต่ละระดับ"')
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('S4:S5')
        .formula(
          '"(11)" & CHAR(10) & "จำนวน" & CHAR(10) & "เงิน" & CHAR(10) & "รวมทั้ง" & CHAR(10) & "ป.ตรี" & CHAR(10) & "ต่อเนื่อง" & CHAR(10) & "และ ป." & CHAR(10) & "โท-เอก นานาชาติ"'
        )
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('T4:T5')
        .formula(
          '"(12)" & CHAR(10) & "ลาย" & CHAR(10) & "มือ" & CHAR(10) & "ชื่อ" & CHAR(10) & "ผู้รับ" & CHAR(10) & "เงิน"'
        )
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('U4:U5')
        .formula(
          '"(13)" & CHAR(10) & "วัน/" & CHAR(10) & "เดือน/" & CHAR(10) & "ปีที่" & CHAR(10) & "รับเงิน"'
        )
        .wrapText()
        .border('box')
        .align('center', 'top')
      excel
        .cells('V4:V5')
        .formula('"(14)" & CHAR(10) & "หมาย" & CHAR(10) & "เหตุ"')
        .wrapText()
        .border('box')
        .align('center')
      excel
        .cell('E5')
        .formula('"ป.ตรี" & CHAR(10) & "หรือ" & CHAR(10) & "เทียบเท่า"')
        .wrapText()
        .border('box')
        .align('center')
      excel
        .cell('F5')
        .formula('"ป.โท-เอก" & CHAR(10) & "หรือ" & CHAR(10) & "เทียบเท่า"')
        .wrapText()
        .border('box')
        .align('center')

      let index = 0
      for (const col of Excel.range('G:R')) {
        if (index === 4) {
          index = 0
        }
        excel
          .cell(`${col}5`)
          .formula(`${degree[index]}`)
          .wrapText()
          .border('box')
          .align('center')
        index++
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

      for (const col of Excel.range('A:V')) {
        for (let j = 1; j <= 10; j++) {
          excel.cell(`${col}${j + 5}`).border('box')
        }
      }

      excel.cells('A16:J16').border('box')

      for (const col of Excel.range('K:V')) {
        excel.cell(`${col}${16}`).border('box')
      }
    } // ===== End If ====

    // ===== Order ====

    excel
      .cell(`A${(teacherIndex % 10) + 6}`)
      .value((teacherIndex % 10) + 1)
      .align('center')

    // ===== TeacherList ====
    excel
      .cell(`B${(teacherIndex % 10) + 6}`)
      .value(
        `${teacherList[teacherIndex].title}${teacherList[teacherIndex].name}`
      )
      .align('left')
    excel
      .cell(`C${(teacherIndex % 10) + 6}`)
      .value(`${(TeacherTitle as any)[teacherList[teacherIndex].title]}`)
      .align('center')

    // ===== Degree ====
    const teachBachelor = teacherList[teacherIndex]
      .getWorkloadList()
      .some((workload) =>
        [Degree.Bachelor, Degree.BachelorInter, Degree.BachelorCon].includes(
          workload.degree
        )
      )
    if (teachBachelor) {
      excel
        .cell(`E${(teacherIndex % 10) + 6}`)
        .value(`✔`)
        .align('center')
    } else {
      excel
        .cell(`F${(teacherIndex % 10) + 6}`)
        .value(`✔`)
        .align('center')
    }
  }
}

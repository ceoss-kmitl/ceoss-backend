import dayjs from 'dayjs'
import { range, chain, min, max, get } from 'lodash'

import { IDownloadAssistantExcelQuery } from '@controllers/types/subject'
import { Excel, PaperSize } from '@libs/Excel'
import { Setting } from '@models/setting'
import { Subject } from '@models/subject'
import { DocumentPattern } from '@constants/common'
import { Teacher } from '@models/teacher'
import { NotFoundError } from '@errors/notFoundError'

export async function generateAssistantExcel2(
  excel: Excel,
  subject: Subject,
  query: IDownloadAssistantExcelQuery
) {
  const {
    documentDate,
    documentPattern,
    approvalNumber,
    approvalDate,
    teacherId,
  } = query

  const setting = await Setting.get()
  const section = subject.workloadList[0].section

  const teacher = await Teacher.findOne({
    where: { id: teacherId },
  })

  if (!teacher)
    throw new NotFoundError('ไม่พบรายชื่ออาจารย์', [
      `teacherId ${teacherId} not found`,
    ])

  // ===== Excel setup =====
  excel.addSheet('หลักฐานการปฏิบัติงาน', {
    pageSetup: {
      paperSize: PaperSize.A4,
      orientation: 'portrait',
      verticalCentered: true,
      horizontalCentered: true,
      fitToPage: true,
      printArea: 'A1:I31',
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
      defaultColWidth: Excel.pxCol(80),
      defaultRowHeight: Excel.pxRow(30),
    },
  })

  // ===== Title =====
  excel.font('TH Sarabun New').fontSize(15)

  excel
    .cells('A2:I2')
    .value(
      `หลักฐานการปฏิบัติงานของนักศึกษาช่วยปฏิบัติงาน เกี่ยวกับช่วยงานจัดเตรียมเอกสารต่างๆ จัดการระบบต่างๆ`
    )
    .align('center', 'middle')

  const rawTaNameList = chain(subject.workloadList)
    .map((w) => w.getAssistantList())
    .flatten()
    .uniqBy('id')
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((ta) => ta.name)
    .value()

  let taNameList = ''

  if (rawTaNameList.length > 2) {
    taNameList = `${rawTaNameList
      .slice(0, rawTaNameList.length - 2)
      .join(',')} และ${rawTaNameList[rawTaNameList.length - 1]}`
  } else if (rawTaNameList.length === 2) {
    taNameList = `${rawTaNameList[0]} และ${rawTaNameList[1]}`
  } else if (rawTaNameList.length === 1) {
    taNameList = rawTaNameList[0]
  }

  const TitleTextLine2 = {
    [DocumentPattern.ONLINE]: `ทางออนไลน์ แบบ Video Call ของ ${taNameList}`,
    [DocumentPattern.ONSITE]: `ทางออนไลน์ แบบ Video Call ของ ${taNameList}`,
  }

  excel
    .cells('A3:I3')
    .value(`ปฏิบัติงาน${TitleTextLine2[documentPattern]}`)
    .align('center', 'middle')

  excel
    .cells('A4:I4')
    .value(`วิชา ${subject.code} ${subject.name} กลุ่ม ${section}`)
    .align('center', 'middle')

  const TitleTextLine5 = {
    [DocumentPattern.ONLINE]: `ประจำเดือน${dayjs(documentDate).format(
      'MMMM  BBBB'
    )}`,
    [DocumentPattern.ONSITE]: `ประจำเดือน${dayjs(documentDate).format(
      'MMMM  BBBB'
    )}`,
  }
  excel
    .cells('A5:I5')
    .value(TitleTextLine5[documentPattern])
    .align('center', 'middle')

  const rawDateList = chain(subject.workloadList)
    .map((w) =>
      w.assistantWorkloadList.map((aw) => aw.dayList.map((d) => d.getTime()))
    )
    .flatten()
    .flatten()
    .uniq()
    .sort((a, b) => a - b)
    .filter((d) => dayjs(d).isSame(dayjs(documentDate), 'month'))
    .value()

  const startDate = dayjs(min(rawDateList))
  const lastDate = dayjs(max(rawDateList))

  excel
    .cells('A6:I6')
    .value(
      `ตั้งแต่วันที่  ${startDate.format(
        'D MMMM BBBB'
      )}  ถึงวันที่  ${lastDate.format('D MMMM BBBB')}`
    )
    .align('center', 'middle')

  const taPayRate = subject.isInter
    ? setting.assistantPayRateInter
    : setting.assistantPayRate

  const totalMoney =
    rawDateList.length * rawTaNameList.length * subject.labHours * taPayRate

  const TitleTextLine7 = {
    [DocumentPattern.ONLINE]: `"ตามหนังสือขออนุมัติเลขที่  ${approvalNumber} ลงวันที่ ${dayjs(
      approvalDate
    ).format('D MMMM BBBB')}  ยอดเงิน  "&TEXT(${totalMoney},"#,##0;;;")&" บาท"`,
    [DocumentPattern.ONSITE]: `"ตามหนังสือขออนุมัติเลขที่  ${approvalNumber} ลงวันที่ ${dayjs(
      approvalDate
    ).format('D MMMM BBBB')}  ยอดเงิน  "&TEXT(${totalMoney},"#,##0;;;")&" บาท"`,
  }

  excel
    .cells('A7:I7')
    .formula(TitleTextLine7[documentPattern])
    .align('center', 'middle')

  excel.cells('A8:I8').value(`คณะวิศวกรรมศาสตร์ สจล.`).align('center', 'middle')

  for (const [i, name] of rawTaNameList.entries()) {
    // ===== TA Name Header =====
    excel
      .cell(`B${10 + 7 * i}`)
      .value(`${i + 1}.`)
      .align('center')
    excel
      .cells(`C${10 + 7 * i}:E${10 + 7 * i}`)
      .value(name)
      .align('center')

    // ===== Table Header =====
    excel
      .cell(`B${11 + 7 * i}`)
      .value('ลำดับที่')
      .border('box')
      .align('center')
    excel
      .cells(`C${11 + 7 * i}:E${11 + 7 * i}`)
      .value('วัน/เดือน/ปี')
      .border('box')
      .align('center')
    excel
      .cells(`F${11 + 7 * i}:G${11 + 7 * i}`)
      .value('เวลา')
      .border('box')
      .align('center')
    excel
      .cell(`H${11 + 7 * i}`)
      .value('ลายมือชื่อ')
      .border('box')
      .align('center')

    let count = 0
    const time = chain(subject.workloadList)
      .map((w) => w.getTimeStringList())
      .flatten()
      .map((t) => ({
        start: t.start.replace(':', '.'),
        end: t.end.replace(':', '.'),
      }))
      .head()
      .value()

    // ===== Table Outline =====
    for (const row of range(12 + 7 * i, 16 + 7 * i)) {
      excel.cell(`B${row}`).border('box').align('center')
      excel.cells(`C${row}:E${row}`).border('box').align('center')
      excel.cells(`F${row}:G${row}`).border('box').align('center')
      excel.cell(`H${row}`).border('box').align('center')

      if (get(rawDateList, count)) {
        excel.cell(`B${row}`).value(`${count + 1}.`)
        excel
          .cell(`C${row}`)
          .value(dayjs(rawDateList[count]).format('dddd D MMMM BBBB'))
        excel.cell(`F${row}`).value(`${time.start}-${time.end} น.`)
        count++
      }
    }
  }

  const footerRow = 17 + 7 * (rawTaNameList.length - 1)

  // ===== Table Footer =====

  const ApprovalText = {
    [DocumentPattern.ONLINE]: `ทางออนไลน์ แบบ Video Call ตามลายมือชื่อทางอิเล็กทรอนิกส์จริง`,
    [DocumentPattern.ONSITE]: `ทางออนไลน์ แบบ Video Call ตามลายมือชื่อทางอิเล็กทรอนิกส์จริง`,
  }
  excel
    .cells(`A${footerRow}:I${footerRow}'`)
    .align('center', 'middle')
    .value(
      `ข้าพเจ้าขอรับรองว่านักศึกษาได้ปฏิบัติงาน${ApprovalText[documentPattern]}`
    )

  excel
    .cells(`E${footerRow + 2}:I${footerRow + 2}`)
    .align('center', 'middle')
    .value(
      'ลงชื่อ...........................................................ผู้รับรอง'
    )

  excel
    .cells(`E${footerRow + 3}:I${footerRow + 3}`)
    .align('center', 'middle')
    .value(`(${teacher.name})`)

  const GuardianSign = {
    [DocumentPattern.ONLINE]: 'อาจารย์ผู้รับผิดชอบ',
    [DocumentPattern.ONSITE]: 'อาจารย์ผู้รับผิดชอบ',
  }
  excel
    .cells(`E${footerRow + 4}:I${footerRow + 4}`)
    .align('center', 'middle')
    .value(GuardianSign[documentPattern])

  excel
    .cells(`E${footerRow + 6}:I${footerRow + 6}`)
    .align('center', 'middle')
    .value(
      'ลงชื่อ...........................................................ผู้รับรอง'
    )
  excel
    .cells(`E${footerRow + 7}:I${footerRow + 7}`)
    .align('center', 'middle')
    .value(`(${setting.headName})`)
  excel
    .cells(`E${footerRow + 8}:I${footerRow + 8}`)
    .align('center', 'middle')
    .value('หัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์')

  excel
    .cells(`E${footerRow + 10}:I${footerRow + 10}`)
    .align('center', 'middle')
    .value(
      'ลงชื่อ...........................................................ผู้รับรอง'
    )
  excel
    .cells(`E${footerRow + 11}:I${footerRow + 11}`)
    .align('center', 'middle')
    .value(`(${setting.viceDeanName})`)
  excel
    .cells(`E${footerRow + 12}:I${footerRow + 12}`)
    .align('center', 'middle')
    .value('รองคณบดีคณะวิศวกรรมศาสตร์')
}

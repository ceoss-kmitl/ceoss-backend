import dayjs from 'dayjs'
import { range, chain } from 'lodash'

import { IDownloadAssistantExcelQuery } from '@controllers/types/subject'
import { Excel, PaperSize } from '@libs/Excel'
import { Setting } from '@models/setting'
import { Subject } from '@models/subject'
import { Assistant } from '@models/assistant'
import { Time } from '@models/time'
import { DocumentPattern } from '@constants/common'
import { Teacher } from '@models/teacher'

export async function generateAssistantExcel2(
  excel: Excel,
  subject: Subject,
  query: IDownloadAssistantExcelQuery
) {
  const {
    academicYear,
    semester,
    documentDate,
    documentPattern,
    approvalNumber,
    approvalDate,
  } = query

  const setting = await Setting.get()
  const section = subject.workloadList[0].section

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

  const TitleTextLine2 = {
    [DocumentPattern.ONLINE]: `ทางออนไลน์ แบบ Video Call ของ ... `,
    [DocumentPattern.ONSITE]: `สอนรายวิชาปฏิบัติการ ของ ...`,
  }

  excel
    .cells('A3:I3')
    .value(`ปฏิบัติงาน${TitleTextLine2[documentPattern]}`)
    .align('center', 'middle')

  // const TitleTextLine2 = {
  //   [DocumentPattern.ONLINE]: `ทางออนไลน์ แบบ Video Call วิชา ${subject.code} ${subject.name}   (กลุ่ม ${section}) `,
  //   [DocumentPattern.ONSITE]: `สอนรายวิชาปฏิบัติการ ${subject.code} ${subject.name} (กลุ่ม ${section}) ประจำภาคเรียนที่ ${semester}/${academicYear}`,
  // }

  excel
    .cells('A4:I4')
    .value(`วิชา ${subject.code} ${subject.name} กลุ่ม ${section}`)
    .align('center', 'middle')

  const TitleTextLine5 = {
    [DocumentPattern.ONLINE]: `ประจำเดือน  ${dayjs(documentDate).format(
      'MMMM  BBBB'
    )}`,
    [DocumentPattern.ONSITE]: `ชื่อส่วนราชการ คณะวิศวกรรมศาสตร์   จังหวัด  กรุงเทพฯ  ประจำเดือน  ${dayjs(
      documentDate
    ).format('MMMM  BBBB')}`,
  }
  excel
    .cells('A5:I5')
    .value(TitleTextLine5[documentPattern])
    .align('center', 'middle')

  excel
    .cells('A6:I6')
    .value(
      `ตั้งแต่วันที่  ${dayjs(documentDate).format(
        'MMMM  BBBB'
      )}  ถึงวันที่  ${dayjs(documentDate).format('MMMM  BBBB')}`
    )
    .align('center', 'middle')

  const TitleTextLine7 = {
    [DocumentPattern.ONLINE]: `"ตามหนังสือขออนุมัติเลขที่  ${approvalNumber} ลงวันที่ ${dayjs(
      approvalDate
    ).format('D MMMM BBBB')}  ยอดเงิน  "&TEXT(AD20,"#,##0;;;")&" บาท"`,
    [DocumentPattern.ONSITE]: `"เบิกตามฎีกาที่...................................................ลงวันที่..........................................เดือน.......................................พ.ศ. ........................"`,
  }

  excel
    .cells('A7:I7')
    .formula(TitleTextLine7[documentPattern])
    .align('center', 'middle')

  excel.cells('A8:I8').value(`คณะวิศวกรรมศาสตร์ สจล.`).align('center', 'middle')

  // ===== Table Header =====
  excel.cell('B11').value('ลำดับที่').border('box').align('center')
  excel.cells('C11:E11').value('วัน/เดือน/ปี').border('box').align('center')
  excel.cells('F11:G11').value('เวลา').border('box').align('center')
  excel.cell('H11').value('ลายมือชื่อ').border('box').align('center')

  // ===== Table Outline =====
  for (const row of range(12, 14)) {
    excel.cell(`B${row}`).border('box').align('center')
    excel.cells(`C${row}:E${row}`).border('box').align('center')
    excel.cells(`F${row}:G${row}`).border('box').align('center')
    excel.cell(`H${row}`).border('box').align('center')
  }

  // ===== Table Footer =====
  excel.fontSize(14)
  excel
    .cells('C22:J22')
    .align('left', 'middle')
    .value('รวมเงินจ่ายทั้งสิ้น(ตัวอักษร) =')
    .bold()
  excel
    .cells('K22:Z22')
    .align('left', 'middle')
    .formula(`".........."&BAHTTEXT(AD20)&".........."`)
    .bold()

  const ApprovalText = {
    [DocumentPattern.ONLINE]: `ทางออนไลน์ แบบ Video Call ตามลายมือชื่อทางอิเล็กทรอนิกส์จริง`,
    [DocumentPattern.ONSITE]: `นอกเวลาจริง`,
  }
  excel
    .cells('A16:I16')
    .align('center', 'middle')
    .value(
      `ข้าพเจ้าขอรับรองว่านักศึกษาได้ปฏิบัติงาน${ApprovalText[documentPattern]}`
    )

  excel
    .cells('E18:I18')
    .align('center', 'middle')
    .value(
      'ลงชื่อ...........................................................ผู้รับรอง'
    )

  excel.cells('E19:I19').align('center', 'middle').value(`(ชื่ออาจารย์)`)

  const GuardianSign = {
    [DocumentPattern.ONLINE]: 'อาจารย์ผู้รับผิดชอบ',
    [DocumentPattern.ONSITE]: 'หัวหน้าผู้ควบคุม',
  }
  excel
    .cells('E20:I20')
    .align('center', 'middle')
    .value(GuardianSign[documentPattern])

  excel
    .cells('E22:I22')
    .align('center', 'middle')
    .value(
      'ลงชื่อ...........................................................ผู้รับรอง'
    )
  excel.cells('E23:I23').align('center', 'middle').value(`(ชื่ออาจารย์)`)
  excel
    .cells('E24:I24')
    .align('center', 'middle')
    .value('หัวหน้าภาควิชาวิศวกรรมคอมพิวเตอร์')

  excel
    .cells('E26:I26')
    .align('center', 'middle')
    .value(
      'ลงชื่อ...........................................................ผู้รับรอง'
    )
  excel.cells('E27:I27').align('center', 'middle').value(`(ชื่ออาจารย์)`)
  excel
    .cells('E28:I28')
    .align('center', 'middle')
    .value('รองคณบดีคณะวิศวกรรมศาสตร์')

  /**
   * ==================================
   * [     INSERT DATA INTO TABLE     ]
   * ==================================
   */

  // Start Prepare data
  const tmpList: {
    assistant: Assistant
    dateList: string[]
    time: string
    timeSlot: number
  }[] = []
  subject.workloadList.forEach((workload) => {
    workload.assistantWorkloadList.forEach((aw) => {
      const timeSlotStart = workload.getFirstTimeSlot()
      const timeSlotEnd = workload.getLastTimeSlot() + 1

      tmpList.push({
        assistant: aw.assistant,
        dateList: aw.dayList.map((day) =>
          dayjs(day).format('ddddที่ D MMM BB')
        ),
        time: `${Time.toTimeString(timeSlotStart)} - ${Time.toTimeString(
          timeSlotEnd
        )}`,
        timeSlot: (timeSlotEnd - timeSlotStart) / 4,
      })
    })
  })
  const assistantWithDateList = chain(tmpList)
    .groupBy('assistant.id')
    .mapValues((value) => ({
      assistant: value[0].assistant,
      dateTimeList: chain(
        value.map((each) =>
          each.dateList.map(
            (d) => [`${d} (${each.time})`, each.timeSlot] as [string, number]
          )
        )
      )
        .flatten()
        .sort((a, b) => a[0].localeCompare(b[0], 'th'))
        .value(),
    }))
    .values()
    .value()
  // End Prepare data

  // Start insert
  for (let i = 0; i < assistantWithDateList.length; i++) {
    const data = assistantWithDateList[i]

    excel.fontSize(14)
    // ลำดับที่
    excel
      .cell(`A${7 + i}`)
      .value(i + 1)
      .bold()

    // ชื่อ
    excel
      .cell(`B${7 + i}`)
      .value(data.assistant.name)
      .bold()

    // อัตราเงินตอบแทน
    excel
      .cell(`C${7 + i}`)
      .value(
        subject.isInter
          ? setting.assistantPayRateInter
          : setting.assistantPayRate
      )
      .bold()

    // วันเวลาเอียง ๆ
    for (let j = 0; j < data.dateTimeList.length; j++) {
      const [dateTime, hr] = data.dateTimeList[j]
      const col = Excel.toAlphabet(Excel.toNumber('D') + j)

      excel.fontSize(12)
      excel.cell(`${col}6`).value(dateTime).bold()

      excel.fontSize(14)
      excel
        .cell(`${col}${7 + i}`)
        .bold()
        .value(hr)
        .numberFormat('General;#;;@')
    }
  }
}

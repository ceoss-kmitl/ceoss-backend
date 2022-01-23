import dayjs from 'dayjs'
import { range, chain } from 'lodash'

import { IDownloadAssistantExcelQuery } from '@controllers/types/subject'
import { Excel, PaperSize } from '@libs/Excel'
import { Setting } from '@models/setting'
import { Subject } from '@models/subject'
import { Assistant } from '@models/assistant'
import { Time } from '@models/time'

export async function generateAssistantExcel1(
  excel: Excel,
  subject: Subject,
  query: IDownloadAssistantExcelQuery
) {
  const { documentDate, documentPattern, approvalNumber, approvalDate } = query

  const setting = await Setting.get()
  const section = subject.workloadList[0].section

  // ===== Excel setup =====
  excel.addSheet('ตารางเบิกเงิน', {
    pageSetup: {
      paperSize: PaperSize.A4,
      orientation: 'landscape',
      verticalCentered: true,
      horizontalCentered: true,
      fitToPage: true,
      printArea: 'A1:AG24',
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
      defaultColWidth: Excel.pxCol(20),
      defaultRowHeight: Excel.pxRow(29),
    },
  })

  // ===== Layout =====
  excel.cell('A1').width(Excel.pxCol(39))
  excel.cell('B1').width(Excel.pxCol(170))
  excel.cell('C1').width(Excel.pxCol(45))
  for (const col of Excel.range('D:Z')) {
    excel.cell(`${col}1`).width(Excel.pxCol(19))
  }
  excel.cell('AA1').width(Excel.pxCol(47))
  excel.cell('AB1').width(Excel.pxCol(47))
  excel.cell('AC1').width(Excel.pxCol(47))
  excel.cell('AD1').width(Excel.pxCol(64))
  excel.cell('AE1').width(Excel.pxCol(47))
  excel.cell('AF1').width(Excel.pxCol(103))
  excel.cell('AG1').width(Excel.pxCol(50))

  // ===== Title =====
  excel.font('Cordia New').fontSize(14)
  excel
    .cells('A1:AG1')
    .value(
      `หลักฐานการจ่ายเงินตอบแทนให้นักศึกษาช่วยปฏิบัติงานทางออนไลน์ แบบ Video Call วิชา ${subject.code} ${subject.name}   (กลุ่ม ${section}) `
    )
    .bold()
    .align('center', 'middle')
  excel
    .cells('A2:AG2')
    .value(`ประจำเดือน  ${dayjs(documentDate).format('MMMM  BBBB')}`)
    .bold()
    .align('center', 'middle')
    .fontSize(16)
  excel
    .cells('A3:AG3')
    .formula(
      `"ตามหนังสือขออนุมัติเลขที่  ${approvalNumber} ลงวันที่ ${dayjs(
        approvalDate
      ).format(
        'D MMMM BBBB'
      )}  ยอดเงิน  "&TEXT(AD20,"#,##0;;;")&" บาท  คณะวิศวกรรมศาสตร์ สจล."`
    )
    .bold()
    .align('center', 'middle')
    .fontSize(16)

  // ===== Table Header =====
  excel.fontSize(12)
  excel
    .cell('A5')
    .value('ลำดับที่')
    .border('left-bold', 'top-bold', 'right-bold')
    .align('center', 'bottom')
    .height(Excel.pxRow(81))
  excel
    .cell('A6')
    .border('left-bold', 'bottom-bold', 'right-bold')
    .height(Excel.pxRow(94))
  excel
    .cell('B5')
    .value('ชื่อ')
    .border('top-bold', 'right-bold')
    .align('center', 'bottom')
  excel.cell('B6').border('bottom-bold', 'right-bold')
  excel
    .cell('C5')
    .value('อัตราเงิน')
    .border('top-bold', 'right-bold')
    .align('center', 'bottom')
  excel
    .cell('C6')
    .value('ตอบแทน')
    .border('bottom-bold', 'right-bold')
    .align('center', 'top')
  for (const col of Excel.range('D:Z')) {
    excel
      .cells(`${col}5:${col}6`)
      .border('box', 'top-bold', 'bottom-bold')
      .rotate(90)
      .bold()
      .align('center', 'middle')
  }
  excel
    .cells('AA5:AC5')
    .value('รวมเวลาปฏิบัติงาน')
    .align('center', 'middle')
    .border('box', 'top-bold', 'right-bold')
  excel
    .cell('AA6')
    .value('วันปกติ')
    .align('center', 'middle')
    .border('box', 'bottom-bold')
  excel
    .cell('AB6')
    .value('วันหยุด')
    .align('center', 'middle')
    .border('box', 'bottom-bold')
  excel
    .cell('AC6')
    .value('ชั่วโมง')
    .align('center', 'middle')
    .border('box', 'bottom-bold', 'right-bold')
  excel.cell('AD5').border('top-bold', 'right-bold')
  excel
    .cell('AD6')
    .border('bottom-bold', 'right-bold')
    .value('จำนวนเงิน')
    .align('center', 'top')
  excel
    .cell('AE5')
    .border('top-bold', 'right-bold')
    .value('ว.ด.ป')
    .align('center', 'bottom')
  excel
    .cell('AE6')
    .border('bottom-bold', 'right-bold')
    .value('ที่รับเงิน')
    .align('center', 'top')
  excel
    .cell('AF5')
    .border('top-bold', 'right-bold')
    .value('ลายเซ็นชื่อผู้รับเงิน')
    .align('center', 'bottom')
  excel.cell('AF6').border('bottom-bold', 'right-bold')
  excel
    .cell('AG5')
    .border('top-bold', 'right-bold')
    .value('หมายเหตุ')
    .align('center', 'bottom')
  excel.cell('AG6').border('bottom-bold', 'right-bold')

  // ===== Table Outline =====
  for (const row of range(7, 21)) {
    excel
      .cell(`A${row}`)
      .align('center', 'middle')
      .border('box', 'left-bold', 'right-bold')
    excel.cell(`B${row}`).align('left', 'middle').border('box', 'right-bold')
    excel.cell(`C${row}`).align('center', 'middle').border('box', 'right-bold')
    for (const col of Excel.range('D:Z')) {
      excel.cell(`${col}${row}`).align('center', 'middle').border('box-bold')
    }
    excel.cell(`AA${row}`).align('center', 'middle').border('box')
    excel.cell(`AB${row}`).align('center', 'middle').border('box')

    excel.fontSize(14)
    excel
      .cell(`AC${row}`)
      .align('center', 'middle')
      .border('box')
      .formula(`SUM(D${row}:Z${row})`)
      .numberFormat('General;#;;@')
      .bold()
    excel
      .cell(`AD${row}`)
      .align('right', 'middle')
      .border('box', 'left-bold', 'right-bold')
      .formula(`AC${row}*C${row}`)
      .numberFormat('#,##0;;;')
      .bold()
    excel.cell(`AE${row}`).border('box', 'right-bold')
    excel.cell(`AF${row}`).border('box', 'right-bold')
    excel.cell(`AG${row}`).border('box', 'right-bold')

    if (row === 20) {
      for (const col of Excel.range('A:AG')) {
        excel.cell(`${col}${row}`).border('bottom-bold')
      }
      excel.fontSize(14)
      excel.cell('AC20').formula('SUM(AC7:AC19)').bold()
      excel.cell('AD20').formula('SUM(AD7:AD19)').numberFormat('#,##0').bold()
    }
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
  excel
    .cells('B23:AG23')
    .align('left', 'middle')
    .value(
      'ขอรับรองว่า ผู้มีรายชื่อข้างต้นช่วยปฏิบัติงานทางออนไลน์แบบ Video Call จริง'
    )
    .bold()

  excel
    .cells('B24:O24')
    .align('center', 'middle')
    .bold()
    .value('ลงชื่อ........................................อาจารย์ผู้รับผิดชอบ')
  excel
    .cells('R24:AD24')
    .align('center', 'middle')
    .bold()
    .value('ลงชื่อ........................................ผู้จ่ายเงิน')

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
      .value(100)
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

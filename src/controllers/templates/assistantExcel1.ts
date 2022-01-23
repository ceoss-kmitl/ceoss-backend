import dayjs from 'dayjs'
import { range } from 'lodash'

import { IDownloadAssistantExcelQuery } from '@controllers/types/subject'
import { Excel, PaperSize } from '@libs/Excel'
import { Setting } from '@models/setting'
import { Subject } from '@models/subject'

export async function generateAssistantExcel1(
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
    teacherId,
  } = query

  const setting = await Setting.get()
  console.log('B', subject)

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
    .value(
      `ตามหนังสือขออนุมัติเลขที่  ${approvalNumber} ลงวันที่ ${dayjs(
        approvalDate
      ).format('D MMMM BBBB')}  ยอดเงิน  900 บาท  คณะวิศวกรรมศาสตร์ สจล.`
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
    excel.cell(`AC${row}`).align('center', 'middle').border('box')
    excel
      .cell(`AD${row}`)
      .align('right', 'middle')
      .border('box', 'left-bold', 'right-bold')
    excel.cell(`AE${row}`).border('box', 'right-bold')
    excel.cell(`AF${row}`).border('box', 'right-bold')
    excel.cell(`AG${row}`).border('box', 'right-bold')

    if (row === 20) {
      for (const col of Excel.range('A:AG')) {
        excel.cell(`${col}${row}`).border('bottom-bold')
      }
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
}

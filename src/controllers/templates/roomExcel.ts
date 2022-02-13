import { Excel, PaperSize } from '@libs/Excel'
import { Room } from '@models/room'
import { Time } from '@models/time'
import { WorkloadType } from '@constants/common'

export async function generateRoomExcel(
  excel: Excel,
  roomList: Room[],
  academicYear: number,
  semester: number
) {
  // Remove break time slot from timeList
  roomList.forEach((room) => {
    room.workloadList.forEach((workload) => {
      const newTimeList = []
      const tmpTimeList = [...workload.timeList].sort(
        (a, b) => a.startSlot - b.startSlot
      )

      for (let i = 0; i < tmpTimeList.length; i++) {
        // Means next time slot should merge with current time
        if (tmpTimeList[i + 1]?.startSlot - tmpTimeList[i]?.endSlot === 2) {
          const time = new Time()
          time.startSlot = tmpTimeList[i].startSlot
          time.endSlot = tmpTimeList[i + 1].endSlot
          newTimeList.push(time)
          i++
        } else {
          newTimeList.push(tmpTimeList[i])
        }
      }
      workload.timeList = newTimeList
    })
  })

  for (const room of roomList) {
    // ===== Excel setup =====
    excel.addSheet(room.name, {
      pageSetup: {
        paperSize: PaperSize.A4,
        orientation: 'landscape',
        verticalCentered: true,
        horizontalCentered: true,
        fitToPage: true,
        printArea: 'A1:BC17',
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
        defaultRowHeight: Excel.pxRow(25),
      },
    })

    // ==== Header ====
    excel.font('TH SarabunPSK').fontSize(16)
    excel
      .cells('A1:BC1')
      .value(`ตารางการใช้ห้องเรียน ภาคการศึกษาที่ ${semester}/${academicYear}`)
      .bold()
      .align('center', 'middle')
      .height(Excel.pxRow(32))
    excel
      .cells('A2:BC2')
      .value(
        `ชื่อห้อง ECC-${room.name}  อาคารปฎิบัติการ 2  จำนวนที่นั่ง ${room.capacity} คน`
      )
      .bold()
      .align('center', 'middle')
      .height(Excel.pxRow(32))

    // ==== Table outline ====
    excel.cells('A3:C3').value('วัน').border('box').align('center', 'middle')

    // ===== Time hours header ====
    {
      let hours = 8
      for (const range of [
        'D3:G3',
        'H3:K3',
        'L3:O3',
        'P3:S3',
        'T3:W3',
        'X3:AA3',
        'AB3:AE3',
        'AF3:AI3',
        'AJ3:AM3',
        'AN3:AQ3',
        'AR3:AU3',
        'AV3:AY3',
        'AZ3:BC3',
      ]) {
        excel
          .cells(range)
          .value(`${hours++}.00`)
          .border('box')
          .align('center')
      }
    }

    // ===== Day side header =====
    for (const day of [
      'A4:C5 จันทร์',
      'A6:C7 อังคาร',
      'A8:C9 พุธ',
      'A10:C11 พฤหัสบดี',
      'A12:C13 ศุกร์',
      'A14:C15 เสาร์',
      'A16:C17 อาทิตย์',
    ]) {
      const [range, name] = day.split(' ')
      excel.cells(range).value(name).border('box').align('center')
    }

    // ===== Border all time slot =====
    for (let row = 4; row <= 17; row++) {
      for (const col of Excel.range('D:BC')) {
        const colNum = Excel.toNumber(col) - 3

        if (colNum % 4 === 0) {
          excel.cell(`${col}${row}`).border('left')
        }
        if (colNum % 4 === 3) {
          excel.cell(`${col}${row}`).border('right')
        }
        if (row % 2 === 0) {
          excel.cell(`${col}${row}`).border('top')
        } else {
          excel.cell(`${col}${row}`).border('bottom')
        }
      }
    }

    // ==== Room workload ====
    excel.fontSize(13)
    room.workloadList.forEach((workload) => {
      const {
        subject,
        type,
        section,
        dayOfWeek,
        timeList,
        classYear,
        fieldOfStudy,
      } = workload

      const subjectType = {
        [WorkloadType.LECTURE]: '(ท)',
        [WorkloadType.LAB]: '(ป)',
      }

      const row = 4 + dayOfWeek * 2
      for (let i = 0; i < timeList.length; i++) {
        const start = Excel.toAlphabet(3 + (timeList[i].startSlot - 1))
        const end = Excel.toAlphabet(3 + (timeList[i].endSlot - 1))
        const isCoTeaching = workload.getTeacherList().length > 1

        excel
          .cells(`${start}${row}:${end}${row}`)
          .value(
            `${subject.name} ${subjectType[type]} ${classYear}${fieldOfStudy}/${section}`
          )
          .align('center')
          .border('left', 'right')
          .shrink()
        excel
          .cells(`${start}${row + 1}:${end}${row + 1}`)
          .value(
            isCoTeaching
              ? workload
                  .getTeacherList()
                  .map(
                    (teacher) => `${teacher.title}${teacher.name.split(' ')[0]}`
                  )
                  .join('/')
              : workload.getTeacherList()[0].getFullName()
          )
          .align('center')
          .border('left', 'right')
          .shrink()
      }
    })
  }
}

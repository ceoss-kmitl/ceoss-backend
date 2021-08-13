import { Response } from 'express'
import { Delete, Get, JsonController, Param, Res } from 'routing-controllers'
import { Excel, PaperSize } from '@libs/Excel'
import { Workload } from '@models/workload'
import { NotFoundError } from '@errors/notFoundError'

@JsonController()
export class WorkloadController {
  // TODO: Remove this endpoint when start writing real excel file
  @Get('/workload-demo')
  async demo(@Res() res: Response) {
    const excel = new Excel(res, { pageSetup: { paperSize: PaperSize.A4 } })

    excel.cell('A1').value('Hello').italic()
    excel.cell('B3').value('World').border('bottom', 'left')
    excel.cells('C1', 'D3').value('Merge!').bold().align('center', 'middle')
    excel.cell('A4').border('diagonal-down', 'diagonal-up')
    excel.cell('A5').border('diagonal-down')
    excel.cell('A6').border('diagonal-up')

    return excel.sendFile('demo-file')
  }

  @Delete('/workload/:id')
  async discardWorkload(@Param('id') id: string) {
    const workload = await Workload.findOne(id)
    if (!workload) throw new NotFoundError(`Workload ${id} is not found`)

    await workload.remove()
    return 'Workload discarded'
  }
}

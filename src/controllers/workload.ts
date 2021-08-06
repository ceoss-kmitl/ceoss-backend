import { Get, JsonController, Res } from 'routing-controllers'
import { Excel, PaperSize } from '@libs/Excel'
import { Response } from 'express'

@JsonController()
export class WorkloadController {
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
}

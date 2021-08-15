import ExcelJS, { PaperSize } from 'exceljs'
import { Response } from 'express'

export { PaperSize }

export class Excel {
  private workbook: ExcelJS.Workbook
  private sheet: ExcelJS.Worksheet
  private activeCell: ExcelJS.Cell
  private response: Response

  constructor(
    response: Response,
    sheetOptions?: Partial<ExcelJS.AddWorksheetOptions>
  ) {
    this.response = response
    this.workbook = new ExcelJS.Workbook()
    this.sheet = this.workbook.addWorksheet('sheet1', sheetOptions)
    this.activeCell = this.sheet.getCell('A1')
  }

  /**
   * Convert pixel into excel unit (Column)
   */
  static pxCol(pixel: number) {
    return pixel * (1 / 6)
  }

  /**
   * Convert pixel into excel unit (Row)
   */
  static pxRow(pixel: number) {
    return pixel * (17 / 22)
  }

  /**
   * Send `.xlsx` file via `Express.js`
   * @example excel.sendFile('workload-1')
   */
  public async sendFile(fileName: string) {
    this.response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    this.response.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}.xlsx`
    )
    await this.workbook.xlsx.write(this.response)
    this.response.end()
    return this.response
  }

  /**
   * Get cell in worksheet
   * @example cell('A1')
   */
  public cell(id: string) {
    this.activeCell = this.sheet.getCell(id)
    return this
  }

  /**
   * Get merged cell in worksheet
   * @example cells('A1', 'B4')
   */
  public cells(topLeftId: string, bottomRightId: string) {
    this.sheet.mergeCells(topLeftId, bottomRightId)
    this.cell(topLeftId)
    return this
  }

  /**
   * Set value to cell
   * @example value('Hello') value(1234)
   */
  public value(value: ExcelJS.CellValue) {
    this.activeCell.value = value
    return this
  }

  /**
   * Set cell border. Can pass multiple sides
   * @example border('top', 'left') border('diagonal-down')
   */
  public border(...borderSide: MyBorderSide[]) {
    borderSide.forEach((side) => {
      const style: ExcelJS.BorderStyle = side.includes('bold')
        ? 'medium'
        : 'thin'

      switch (side) {
        case 'box':
        case 'box-bold':
          this.borderTop(style)
          this.borderRight(style)
          this.borderBottom(style)
          this.borderLeft(style)
          break
        case 'top':
        case 'top-bold':
          this.borderTop(style)
          break
        case 'right':
        case 'right-bold':
          this.borderRight(style)
          break
        case 'bottom':
        case 'bottom-bold':
          this.borderBottom(style)
          break
        case 'left':
        case 'left-bold':
          this.borderLeft(style)
          break
        case 'diagonal-down':
        case 'diagonal-down-bold':
          this.borderDiagonalLeftTopToRightBottom(style)
          break
        case 'diagonal-up':
        case 'diagonal-up-bold':
          this.borderDiagonalLeftBottomToRightTop(style)
          break
      }
    })

    return this
  }

  /**
   * Set cell alignment both x-axis & y-axis
   * @example align('center', 'middle')
   */
  public align(
    x: ExcelJS.Alignment['horizontal'],
    y: ExcelJS.Alignment['vertical'] = 'top'
  ) {
    this.alignX(x)
    this.alignY(y)
    return this
  }

  /**
   * Underline this cell
   */
  public underline() {
    this.activeCell.font = {
      ...this.activeCell.font,
      underline: true,
    }
    return this
  }

  /**
   * Italic this cell
   */
  public italic() {
    this.activeCell.font = {
      ...this.activeCell.font,
      italic: true,
    }
    return this
  }

  /**
   * Bold this cell
   */
  public bold() {
    this.activeCell.font = {
      ...this.activeCell.font,
      bold: true,
    }
    return this
  }

  /**
   * Strikethrough this cell
   */
  public strike() {
    this.activeCell.font = {
      ...this.activeCell.font,
      strike: true,
    }
    return this
  }

  /**
   * Set font size of this cell
   * @example fontSize(16)
   */
  public fontSize(size: number) {
    this.activeCell.font = {
      ...this.activeCell.font,
      size,
    }
    return this
  }

  /**
   * Set font of this cell
   * @example font('TH Sarabun New')
   */
  public font(fontName: string) {
    this.activeCell.font = {
      ...this.activeCell.font,
      name: fontName,
    }
    return this
  }

  // === Private methods ===

  private borderTop(style: ExcelJS.BorderStyle = 'thin') {
    this.activeCell.border = {
      ...this.activeCell.border,
      top: { style },
    }
    return this
  }

  private borderRight(style: ExcelJS.BorderStyle = 'thin') {
    this.activeCell.border = {
      ...this.activeCell.border,
      right: { style },
    }
    return this
  }

  private borderBottom(style: ExcelJS.BorderStyle = 'thin') {
    this.activeCell.border = {
      ...this.activeCell.border,
      bottom: { style },
    }
    return this
  }

  private borderLeft(style: ExcelJS.BorderStyle = 'thin') {
    this.activeCell.border = {
      ...this.activeCell.border,
      left: { style },
    }
    return this
  }

  private borderDiagonalLeftBottomToRightTop(
    style: ExcelJS.BorderStyle = 'thin'
  ) {
    this.activeCell.border = {
      ...this.activeCell.border,
      diagonal: {
        ...this.activeCell.border?.diagonal,
        up: true,
        style,
      },
    }
    return this
  }

  private borderDiagonalLeftTopToRightBottom(
    style: ExcelJS.BorderStyle = 'thin'
  ) {
    this.activeCell.border = {
      ...this.activeCell.border,
      diagonal: {
        ...this.activeCell.border?.diagonal,
        down: true,
        style,
      },
    }
    return this
  }

  private alignX(position?: ExcelJS.Alignment['horizontal']) {
    this.activeCell.alignment = {
      ...this.activeCell.alignment,
      horizontal: position,
    }
    return this
  }

  private alignY(position?: ExcelJS.Alignment['vertical']) {
    this.activeCell.alignment = {
      ...this.activeCell.alignment,
      vertical: position,
    }
    return this
  }
}

type MyBaseBorderSide =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'box'
  | 'diagonal-down'
  | 'diagonal-up'

type MyBorderSide = MyBaseBorderSide | `${MyBaseBorderSide}-bold`

import ExcelJS, { PaperSize } from 'exceljs'
import { Response } from 'express'

export { PaperSize }

export class Excel {
  private workbook: ExcelJS.Workbook
  private sheet: ExcelJS.Worksheet
  private activeCell: ExcelJS.Cell
  private activeFontFamily: string
  private activeFontSize: number
  private response: Response

  constructor(response: Response) {
    this.response = response
    this.workbook = new ExcelJS.Workbook()
    this.activeFontFamily = 'TH SarabunPSK'
    this.activeFontSize = 16
  }

  /**
   * Convert pixel into excel unit (Column)
   */
  static pxCol(pixel: number) {
    return pixel * (1 / 7.5)
  }

  /**
   * Convert pixel into excel unit (Row)
   */
  static pxRow(pixel: number) {
    return pixel * (17 / 22)
  }

  /**
   * Convert number to Excel alphabet
   * ex. 0=A, 1=B, 26=AA
   */
  static toAlphabet(numeric: number) {
    let alpha = ''
    while (numeric > -1) {
      alpha = String.fromCharCode(65 + (numeric % 26)) + alpha
      numeric = Math.floor(numeric / 26) - 1
    }
    return alpha
  }

  /**
   * Convert Excel alphabet to number
   * ex. A=0, B=1, AA=26
   */
  static toNumber(alphabet: string) {
    let numeric = 0
    let multiplier = 1
    for (let i = alphabet.length - 1; i >= 0; i--) {
      numeric += (alphabet.charCodeAt(i) - 64) * multiplier
      multiplier *= 26
    }
    return numeric - 1
  }

  /**
   * Generate Excel alphabet array
   * from `start` to `end`
   * @example Excel.range('A:D') => ['A','B','C','D']
   */
  static range(alphabet: string) {
    const [start, end] = alphabet.split(':')
    const result: string[] = []
    for (let i = this.toNumber(start); i <= this.toNumber(end); i++) {
      result.push(this.toAlphabet(i))
    }
    return result
  }

  // === Public methods ===

  /**
   * Add new worksheet
   */
  public addSheet(
    name: string,
    options?: Partial<ExcelJS.AddWorksheetOptions>
  ) {
    this.sheet = this.workbook.addWorksheet(name, options)
    this.cell('A1')
  }

  /**
   * Set active sheet
   */
  public setSheet(name: string) {
    this.sheet = this.workbook.getWorksheet(name)
    this.cell('A1')
  }

  /**
   * Send `.xlsx` file via `Express.js`
   * @example return excel.createFile('workload-1')
   */
  public async createFile(fileName: string) {
    this.response.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    this.response.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURI(fileName)}.xlsx`
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
    this.activeCell.font = {
      ...this.activeCell.font,
      name: this.activeFontFamily,
      size: this.activeFontSize,
    }
    return this
  }

  /**
   * Get merged cell in worksheet
   * @example cells('A1:B4')
   */
  public cells(twoId: string) {
    const [topLeftId, bottomRightId] = twoId.split(':')
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
      let style: ExcelJS.BorderStyle = 'thin'
      if (side.includes('bold')) style = 'medium'
      if (side.includes('double')) style = 'double'

      switch (side) {
        case 'box':
        case 'box-bold':
        case 'box-double':
          this.borderTop(style)
          this.borderRight(style)
          this.borderBottom(style)
          this.borderLeft(style)
          break
        case 'top':
        case 'top-bold':
        case 'top-double':
          this.borderTop(style)
          break
        case 'right':
        case 'right-bold':
        case 'right-double':
          this.borderRight(style)
          break
        case 'bottom':
        case 'bottom-bold':
        case 'bottom-double':
          this.borderBottom(style)
          break
        case 'left':
        case 'left-bold':
        case 'left-double':
          this.borderLeft(style)
          break
        case 'diagonal-down':
        case 'diagonal-down-bold':
        case 'diagonal-down-double':
          this.borderDiagonalLeftTopToRightBottom(style)
          break
        case 'diagonal-up':
        case 'diagonal-up-bold':
        case 'diagonal-up-double':
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
    y: ExcelJS.Alignment['vertical'] = 'middle'
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
    this.activeFontSize = size
    return this
  }

  /**
   * Set font of this cell
   * @example font('TH Sarabun New')
   */
  public font(fontName: string) {
    this.activeFontFamily = fontName
    return this
  }

  /**
   * Set excel formula of this cell
   * @example formula('SUM(A1:A5)')
   */
  public formula(expression: string) {
    this.activeCell.value = { formula: expression } as ExcelJS.CellValue
    return this
  }

  /**
   * Set number format of this cell
   * @tutorial https://www.ablebits.com/office-addins-blog/2016/07/07/custom-excel-number-format/
   * @example
   * excel.value(20).numberFormat('0.00') => '20.00'
   * excel.value(3.56).numberFormat('0.0') => '3.6'
   * excel.value(4000).numberFormat('0,000') => '4,000'
   */
  public numberFormat(format: string) {
    this.activeCell.numFmt = format
    return this
  }

  /**
   * Make this cell content scale-down to fit the width of cell
   */
  public shrink() {
    this.activeCell.alignment = {
      ...this.activeCell.alignment,
      shrinkToFit: true,
    }
    return this
  }

  /**
   * Make this cell content rotate by `degree`
   */
  public rotate(degree: number) {
    this.activeCell.alignment = {
      ...this.activeCell.alignment,
      textRotation: degree,
    }
  }

  /**
   * Set width of the active column
   * @example width(Excel.pxCol(10))
   */
  public width(excelPx: number) {
    const col = this.activeCell.col
    this.sheet.getColumn(col).width = excelPx
    return this
  }

  /**
   * Set height of the active row
   * @example height(Excel.pxRow(10))
   */
  public height(excelPx: number) {
    const row = this.activeCell.fullAddress.row
    this.sheet.getRow(row).height = excelPx
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

type MyBorderSide =
  | MyBaseBorderSide
  | `${MyBaseBorderSide}-bold`
  | `${MyBaseBorderSide}-double`

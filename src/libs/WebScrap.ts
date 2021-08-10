import Fetch from 'node-fetch'
import Iconv from 'iconv-lite'
import Cheerio, { CheerioAPI } from 'cheerio'

export class WebScrap {
  private url: string
  private html: string
  private $: CheerioAPI

  constructor(url: string) {
    this.url = url
  }

  async init() {
    const buffer = await Fetch(this.url).then((res) => res.buffer())
    this.html = Iconv.decode(buffer, 'TIS-620')
    this.$ = Cheerio.load(this.html)
  }

  async extractData() {
    const $ = this.$
    const tableList = $('table.hoverTable')
    const result = tableList.toArray().map((table, index) => {
      const subjectList: any[] = []
      let subject = {} as any

      $(table)
        .find('a[title="ดูรายละเอียดวิชานี้"]')
        .closest('tr')
        .toArray()
        .forEach((row) => {
          const columnList = $(row).find('td').toArray()
          const subjectId = $(columnList[0]).text().trim()

          // Found new subject. Push prev subject to subjectList
          // then reset the subject to the new one
          if (subjectId !== '' && subject.subjectId !== subjectId) {
            if (subject.subjectId) subjectList.push(subject)

            subject = {
              subjectId,
              subjectName: $(columnList[2]).text().trim(),
              credit: $(columnList[4]).text().trim(),
              sectionList: [],
            }
          }

          // Add section into subject
          subject.sectionList.push({
            section: $(columnList[6]).text().trim(),
            time: $(columnList[10]).text().trim(),
            room: $(columnList[12]).text().trim(),
            teacher: $(columnList[16]).text().trim(),
          })
        })

      return {
        year: index + 1,
        subjectList,
      }
    })

    return result
  }
}

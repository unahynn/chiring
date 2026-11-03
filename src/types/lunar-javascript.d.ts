// lunar-javascript(만세력 계산 라이브러리)에는 타입 파일이 없어서, 우리가 쓰는 부분만 적어 둬요.
declare module 'lunar-javascript' {
  export class EightChar {
    setSect(sect: 1 | 2): void
    getYear(): string
    getMonth(): string
    getDay(): string
    getTime(): string
  }
  export class Lunar {
    getEightChar(): EightChar
  }
  export class Solar {
    static fromYmdHms(y: number, m: number, d: number, h: number, mi: number, s: number): Solar
    getLunar(): Lunar
  }
}

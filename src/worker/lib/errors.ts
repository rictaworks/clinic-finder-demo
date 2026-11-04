// 業務エラーの種類。app.ts の onError で HTTP ステータスに変換する。

/** 業務ルール違反（Rails 版の StandardError 相当）。422 で { error: message } を返す。 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}

/** 対象が存在しない。404。 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** リクエストの形式不正。400。 */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

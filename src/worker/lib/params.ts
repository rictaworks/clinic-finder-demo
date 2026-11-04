import { INPUT_LIMITS } from '../config/constants';
import { BadRequestError } from './errors';

export type RawParams = Record<string, unknown>;

function isRecord(value: unknown): value is RawParams {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** JSON または フォーム（urlencoded / multipart）のボディを読む。Rails の params 相当。サイズ上限を超えたら 400。 */
export async function readBodyParams(request: Request): Promise<RawParams> {
  const declaredBytes = Number(request.headers.get('content-length') ?? '0');
  if (Number.isFinite(declaredBytes) && declaredBytes > INPUT_LIMITS.BODY_MAX_BYTES) {
    throw new BadRequestError('body too large');
  }
  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > INPUT_LIMITS.BODY_MAX_BYTES) {
      throw new BadRequestError('body too large');
    }
    if (text.trim() === '') {
      return {};
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new BadRequestError('invalid JSON body');
    }
    return isRecord(parsed) ? parsed : {};
  }
  if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    const params: RawParams = {};
    form.forEach((value, key) => {
      params[key] = typeof value === 'string' ? value : '';
    });
    return params;
  }
  return {};
}

/** Rails の .to_s.strip 相当。 */
export function toTrimmedString(value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value).trim();
}

/** 正の整数 ID に変換する。不正なら null。 */
export function toPositiveInt(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const parsed = Number(value.trim());
    return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

const FALSE_LITERALS: ReadonlySet<unknown> = new Set<unknown>([false, 0, '0', 'f', 'F', 'false', 'FALSE', 'off', 'OFF']);

/** Rails の ActiveModel::Type::Boolean#cast 相当。未指定と空文字は null。 */
export function castBoolean(value: unknown): boolean | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return !FALSE_LITERALS.has(value);
}

/** Rails の String#to_f 相当（解釈できなければ 0）。 */
export function toRubyFloat(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

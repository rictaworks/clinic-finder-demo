import type { AreaRow, MasterRepository } from '../repo/masterRepository';
import { writeLog } from '../lib/logger';

/** Rails 版 LocationResolver と同じ正規化（NFKC・trim）。 */
export function normalizeLocationText(text: string): string {
  return text.normalize('NFKC').trim();
}

function aliasMatches(aliases: string | null, text: string): boolean {
  if (!aliases) {
    return false;
  }
  return aliases
    .split(',')
    .map((alias) => alias.trim())
    .filter((alias) => alias !== '')
    .some((alias) => text.includes(alias) || alias.includes(text));
}

function areaMatches(area: AreaRow, text: string, lowerText: string): boolean {
  const englishName = (area.en_name ?? '').toLowerCase();
  const kana = area.kana ?? '';
  return (
    area.name.includes(text) ||
    text.includes(area.name) ||
    (englishName !== '' && (englishName.includes(lowerText) || lowerText.includes(englishName))) ||
    (kana !== '' && kana.includes(text)) ||
    aliasMatches(area.aliases, text)
  );
}

/** 先頭から順に最初に一致した地域を返す（Rails の Area.all.find と同じ順序）。 */
export function matchArea(areas: AreaRow[], rawText: string): AreaRow | null {
  const text = normalizeLocationText(rawText);
  if (text === '') {
    return null;
  }
  const lowerText = text.toLowerCase();
  return areas.find((area) => areaMatches(area, text, lowerText)) ?? null;
}

export class LocationResolver {
  constructor(private readonly master: MasterRepository) {}

  async resolve(rawText: string): Promise<number | null> {
    const areas = await this.master.listAreas();
    const area = matchArea(areas, rawText);
    writeLog('info', 'LocationResolver', 'resolved', { matched: area !== null });
    return area?.id ?? null;
  }
}

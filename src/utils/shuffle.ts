/**
 * Fisher-Yates 셔플 알고리즘
 * 배열을 무작위로 섞어서 새 배열을 반환합니다.
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * 배열에서 랜덤한 요소 하나를 선택합니다.
 */
export function randomChoice<T>(array: T[]): T | undefined {
  if (array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 배열에서 랜덤하게 n개의 요소를 선택합니다 (중복 없음).
 */
export function randomChoices<T>(array: T[], n: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(n, array.length));
}

/**
 * min과 max 사이의 랜덤 정수를 반환합니다 (inclusive).
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

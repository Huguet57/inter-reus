/**
 * Avalua una resposta de text contra les respostes acceptades.
 * Retorna true si coincideix, null si no (pendent de revisió).
 */
export function evaluateTextAnswer(
  userAnswer: string,
  acceptedAnswers: string | null
): boolean | null {
  if (!acceptedAnswers || !acceptedAnswers.trim()) return null;

  const normalized = userAnswer.trim().toLowerCase();
  const accepted = acceptedAnswers
    .split(',')
    .map(a => a.trim().toLowerCase())
    .filter(a => a.length > 0);

  return accepted.includes(normalized) ? true : null;
}

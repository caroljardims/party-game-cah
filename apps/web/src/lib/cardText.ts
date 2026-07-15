/** Preenche uma carta preta com as respostas — no lugar dos "_____" ou, se não houver, ao final da frase. */
export function fillBlackCard(blackText: string, answers: string[]): string {
  if (!/_{3,}/.test(blackText)) {
    return `${blackText} ${answers.join(" ")}`.trim();
  }
  let i = 0;
  return blackText.replace(/_{3,}/g, () => answers[i++] ?? "_____");
}

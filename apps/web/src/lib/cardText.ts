export interface BlackCardSegment {
  text: string;
  isAnswer: boolean;
}

/**
 * Quebra uma carta preta preenchida em segmentos (texto normal / resposta),
 * pra poder destacar a(s) resposta(s) com uma cor diferente ao renderizar.
 * Cada resposta perde o ponto final próprio (a carta preta já tem sua
 * própria pontuação) e vira minúscula quando a lacuna não é o começo do
 * texto, pra ler como uma frase única em vez de um encaixe cru de duas cartas.
 */
export function fillBlackCardSegments(blackText: string, answers: string[]): BlackCardSegment[] {
  if (!/_{3,}/.test(blackText)) {
    const segments: BlackCardSegment[] = [{ text: `${blackText} `, isAnswer: false }];
    answers.forEach((answer, idx) => {
      segments.push({ text: answer, isAnswer: true });
      if (idx < answers.length - 1) segments.push({ text: " ", isAnswer: false });
    });
    return segments;
  }

  const segments: BlackCardSegment[] = [];
  const regex = /_{3,}/g;
  let answerIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(blackText)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: blackText.slice(lastIndex, match.index), isAnswer: false });
    }
    const raw = answers[answerIndex] ?? "_____";
    answerIndex++;
    const trimmed = raw.replace(/\.+\s*$/, "");
    const isSentenceStart = match.index === 0;
    const text = isSentenceStart || trimmed.length === 0 ? trimmed : trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
    segments.push({ text, isAnswer: true });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < blackText.length) {
    segments.push({ text: blackText.slice(lastIndex), isAnswer: false });
  }
  return segments;
}

export interface MathQuestion {
  text: string;
  answer: number;
}

let currentQuestion: MathQuestion | null = null;

export function getCurrentQuestion(): MathQuestion | null {
  return currentQuestion;
}

export function generateMathQuestion(): MathQuestion {
  const answer = Math.floor(Math.random() * 10);
  const isAdd = Math.random() < 0.5;

  let text: string;
  if (isAdd) {
    const a = Math.floor(Math.random() * (answer + 1));
    const b = answer - a;
    const fmt = Math.floor(Math.random() * 3);
    text = fmt === 0 ? `How much is ${a} + ${b}?`
         : fmt === 1 ? `What is ${a} plus ${b}?`
         : `Calculate: ${a} + ${b} =`;
  } else {
    const b = Math.floor(Math.random() * (9 - answer + 1));
    const a = answer + b;
    const fmt = Math.floor(Math.random() * 3);
    text = fmt === 0 ? `What is ${a} - ${b}?`
         : fmt === 1 ? `How much is ${a} minus ${b}?`
         : `Quick! ${a} - ${b} = ?`;
  }

  currentQuestion = { text, answer };
  return currentQuestion;
}

export function initMathQuestion(): void {
  if (!currentQuestion) generateMathQuestion();
}

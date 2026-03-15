export type QuizCategory = 'before' | 'during_indoor' | 'during_outdoor' | 'after' | 'preparedness';

export type QuizOption = {
  id: string;
  labelKey: string;
  explanationKey: string;
  isCorrect: boolean;
};

export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  promptKey: string;
  options: QuizOption[];
};

export type QuizResult = {
  correctCount: number;
  total: number;
  percentage: number;
  mistakes: number;
  heartsRemaining: number;
};

export function evaluateAnswer(
  question: QuizQuestion,
  selectedOptionId: string,
): {
  isCorrect: boolean;
  explanationKey: string;
} {
  const option = question.options.find((candidate) => candidate.id === selectedOptionId);
  if (!option) {
    return {
      isCorrect: false,
      explanationKey: 'quiz.explanations.invalid',
    };
  }

  return {
    isCorrect: option.isCorrect,
    explanationKey: option.explanationKey,
  };
}

export function computeQuizResult(
  questions: QuizQuestion[],
  answers: Record<string, string>,
  startedHearts: number,
  heartsRemaining: number,
): QuizResult {
  let correctCount = 0;

  for (const question of questions) {
    const selected = answers[question.id];
    if (!selected) continue;

    const verdict = evaluateAnswer(question, selected);
    if (verdict.isCorrect) correctCount += 1;
  }

  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    correctCount,
    total,
    percentage,
    mistakes: Math.max(0, startedHearts - heartsRemaining),
    heartsRemaining: Math.max(0, heartsRemaining),
  };
}

export function xpForQuizResult(result: QuizResult): number {
  const base = result.correctCount * 5;
  if (result.percentage >= 80) return base + 20;
  if (result.percentage >= 60) return base + 10;
  return base + 5;
}

export function masteredCategories(
  questions: QuizQuestion[],
  answers: Record<string, string>,
): QuizCategory[] {
  const categories = [...new Set(questions.map((question) => question.category))];

  return categories.filter((category) => {
    const inCategory = questions.filter((question) => question.category === category);
    if (!inCategory.length) return false;

    return inCategory.every((question) => {
      const selected = answers[question.id];
      if (!selected) return false;
      return evaluateAnswer(question, selected).isCorrect;
    });
  });
}

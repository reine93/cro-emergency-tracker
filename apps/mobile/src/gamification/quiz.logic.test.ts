import { describe, expect, it } from 'vitest';
import {
  computeQuizResult,
  evaluateAnswer,
  masteredCategories,
  xpForQuizResult,
  type QuizQuestion,
} from './quiz.logic';

const QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'during_indoor',
    promptKey: 'quiz.questions.q1.prompt',
    options: [
      { id: 'a', labelKey: 'a', explanationKey: 'x', isCorrect: true },
      { id: 'b', labelKey: 'b', explanationKey: 'y', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    category: 'after',
    promptKey: 'quiz.questions.q2.prompt',
    options: [
      { id: 'a', labelKey: 'a', explanationKey: 'x', isCorrect: false },
      { id: 'b', labelKey: 'b', explanationKey: 'y', isCorrect: true },
    ],
  },
];

describe('evaluateAnswer', () => {
  it('marks correct answers', () => {
    const verdict = evaluateAnswer(QUESTIONS[0], 'a');
    expect(verdict.isCorrect).toBe(true);
  });

  it('handles invalid option id safely', () => {
    const verdict = evaluateAnswer(QUESTIONS[0], 'missing');
    expect(verdict.isCorrect).toBe(false);
    expect(verdict.explanationKey).toBe('quiz.explanations.invalid');
  });
});

describe('computeQuizResult', () => {
  it('calculates score and mistakes', () => {
    const answers = { q1: 'a', q2: 'a' };
    const result = computeQuizResult(QUESTIONS, answers, 3, 2);
    expect(result.correctCount).toBe(1);
    expect(result.total).toBe(2);
    expect(result.percentage).toBe(50);
    expect(result.mistakes).toBe(1);
  });
});

describe('xp and category mastery', () => {
  it('awards higher xp for better percentage', () => {
    expect(
      xpForQuizResult({
        correctCount: 5,
        total: 5,
        percentage: 100,
        mistakes: 0,
        heartsRemaining: 3,
      }),
    ).toBe(45);
    expect(
      xpForQuizResult({
        correctCount: 3,
        total: 5,
        percentage: 60,
        mistakes: 2,
        heartsRemaining: 1,
      }),
    ).toBe(25);
  });

  it('returns mastered categories', () => {
    const answers = { q1: 'a', q2: 'b' };
    const mastered = masteredCategories(QUESTIONS, answers);
    expect(mastered).toEqual(['during_indoor', 'after']);
  });
});

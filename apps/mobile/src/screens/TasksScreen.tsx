import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import {
  evaluateHomeSafety,
  topHomeSafetyRecommendations,
  xpForHomeSafetyScore,
  type HomeSafetyCategory,
  type HomeSafetyItem,
} from '../gamification/home.logic';
import { loadHomeSafetyProgress, saveHomeSafetyProgress } from '../gamification/home.storage';
import { usePreparedness } from '../gamification/preparedness.context';
import {
  evaluateKitSelection,
  xpForKitScore,
  type KitItemCategory,
  type KitItemDefinition,
} from '../gamification/kit.logic';
import { loadKitProgress, saveKitProgress } from '../gamification/kit.storage';
import {
  computeQuizResult,
  evaluateAnswer,
  masteredCategories,
  xpForQuizResult,
  type QuizCategory,
  type QuizQuestion,
} from '../gamification/quiz.logic';
import { loadQuizProgress, saveQuizProgress } from '../gamification/quiz.storage';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type KitItem = KitItemDefinition & {
  labelKey: string;
  feedbackKey: string;
};

type HomeSafetyChecklistItem = HomeSafetyItem & {
  labelKey: string;
};

type KitModalStep = 'build' | 'result';
type QuizModalStep = 'question' | 'feedback' | 'result';
type HomeModalStep = 'checklist' | 'result';

const QUIZ_START_HEARTS = 3;

const KIT_ITEMS: KitItem[] = [
  {
    id: 'water',
    category: 'essential',
    labelKey: 'kit.items.water',
    feedbackKey: 'kit.feedback.water',
  },
  {
    id: 'first_aid_kit',
    category: 'essential',
    labelKey: 'kit.items.firstAid',
    feedbackKey: 'kit.feedback.firstAid',
  },
  {
    id: 'flashlight',
    category: 'essential',
    labelKey: 'kit.items.flashlight',
    feedbackKey: 'kit.feedback.flashlight',
  },
  {
    id: 'batteries',
    category: 'essential',
    labelKey: 'kit.items.batteries',
    feedbackKey: 'kit.feedback.batteries',
  },
  {
    id: 'radio',
    category: 'useful',
    labelKey: 'kit.items.radio',
    feedbackKey: 'kit.feedback.radio',
  },
  {
    id: 'documents',
    category: 'useful',
    labelKey: 'kit.items.documents',
    feedbackKey: 'kit.feedback.documents',
  },
  {
    id: 'snacks',
    category: 'useful',
    labelKey: 'kit.items.snacks',
    feedbackKey: 'kit.feedback.snacks',
  },
  {
    id: 'laptop_charger',
    category: 'unnecessary',
    labelKey: 'kit.items.laptopCharger',
    feedbackKey: 'kit.feedback.laptopCharger',
  },
  {
    id: 'umbrella',
    category: 'unnecessary',
    labelKey: 'kit.items.umbrella',
    feedbackKey: 'kit.feedback.umbrella',
  },
  {
    id: 'candle',
    category: 'unsafe',
    labelKey: 'kit.items.candle',
    feedbackKey: 'kit.feedback.candle',
  },
  {
    id: 'perfume',
    category: 'unnecessary',
    labelKey: 'kit.items.perfume',
    feedbackKey: 'kit.feedback.perfume',
  },
  {
    id: 'high_heels',
    category: 'unsafe',
    labelKey: 'kit.items.highHeels',
    feedbackKey: 'kit.feedback.highHeels',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    category: 'during_indoor',
    promptKey: 'quiz.questions.q1.prompt',
    options: [
      {
        id: 'a',
        labelKey: 'quiz.questions.q1.a',
        explanationKey: 'quiz.explanations.q1.a',
        isCorrect: false,
      },
      {
        id: 'b',
        labelKey: 'quiz.questions.q1.b',
        explanationKey: 'quiz.explanations.q1.b',
        isCorrect: true,
      },
      {
        id: 'c',
        labelKey: 'quiz.questions.q1.c',
        explanationKey: 'quiz.explanations.q1.c',
        isCorrect: false,
      },
      {
        id: 'd',
        labelKey: 'quiz.questions.q1.d',
        explanationKey: 'quiz.explanations.q1.d',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q2',
    category: 'after',
    promptKey: 'quiz.questions.q2.prompt',
    options: [
      {
        id: 'a',
        labelKey: 'quiz.questions.q2.a',
        explanationKey: 'quiz.explanations.q2.a',
        isCorrect: true,
      },
      {
        id: 'b',
        labelKey: 'quiz.questions.q2.b',
        explanationKey: 'quiz.explanations.q2.b',
        isCorrect: false,
      },
      {
        id: 'c',
        labelKey: 'quiz.questions.q2.c',
        explanationKey: 'quiz.explanations.q2.c',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q3',
    category: 'during_outdoor',
    promptKey: 'quiz.questions.q3.prompt',
    options: [
      {
        id: 'a',
        labelKey: 'quiz.questions.q3.a',
        explanationKey: 'quiz.explanations.q3.a',
        isCorrect: true,
      },
      {
        id: 'b',
        labelKey: 'quiz.questions.q3.b',
        explanationKey: 'quiz.explanations.q3.b',
        isCorrect: false,
      },
      {
        id: 'c',
        labelKey: 'quiz.questions.q3.c',
        explanationKey: 'quiz.explanations.q3.c',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q4',
    category: 'preparedness',
    promptKey: 'quiz.questions.q4.prompt',
    options: [
      {
        id: 'a',
        labelKey: 'quiz.questions.q4.a',
        explanationKey: 'quiz.explanations.q4.a',
        isCorrect: true,
      },
      {
        id: 'b',
        labelKey: 'quiz.questions.q4.b',
        explanationKey: 'quiz.explanations.q4.b',
        isCorrect: false,
      },
      {
        id: 'c',
        labelKey: 'quiz.questions.q4.c',
        explanationKey: 'quiz.explanations.q4.c',
        isCorrect: false,
      },
    ],
  },
  {
    id: 'q5',
    category: 'before',
    promptKey: 'quiz.questions.q5.prompt',
    options: [
      {
        id: 'a',
        labelKey: 'quiz.questions.q5.a',
        explanationKey: 'quiz.explanations.q5.a',
        isCorrect: false,
      },
      {
        id: 'b',
        labelKey: 'quiz.questions.q5.b',
        explanationKey: 'quiz.explanations.q5.b',
        isCorrect: true,
      },
      {
        id: 'c',
        labelKey: 'quiz.questions.q5.c',
        explanationKey: 'quiz.explanations.q5.c',
        isCorrect: false,
      },
    ],
  },
];

const HOME_SAFETY_ITEMS: HomeSafetyChecklistItem[] = [
  {
    id: 'secure_shelves',
    category: 'furniture',
    weight: 20,
    labelKey: 'homeSafety.items.secureShelves',
  },
  { id: 'anchor_tv', category: 'furniture', weight: 10, labelKey: 'homeSafety.items.anchorTv' },
  {
    id: 'remove_heavy_above_bed',
    category: 'bedroom',
    weight: 15,
    labelKey: 'homeSafety.items.removeHeavyAboveBed',
  },
  {
    id: 'identify_safe_spots',
    category: 'bedroom',
    weight: 15,
    labelKey: 'homeSafety.items.identifySafeSpots',
  },
  {
    id: 'secure_kitchen_cabinets',
    category: 'kitchen',
    weight: 12,
    labelKey: 'homeSafety.items.secureKitchenCabinets',
  },
  {
    id: 'store_breakables_low',
    category: 'kitchen',
    weight: 8,
    labelKey: 'homeSafety.items.storeBreakablesLow',
  },
  { id: 'family_plan', category: 'planning', weight: 10, labelKey: 'homeSafety.items.familyPlan' },
  {
    id: 'emergency_contacts',
    category: 'planning',
    weight: 10,
    labelKey: 'homeSafety.items.emergencyContacts',
  },
  {
    id: 'know_gas_shutoff',
    category: 'utilities',
    weight: 10,
    labelKey: 'homeSafety.items.knowGasShutoff',
  },
  {
    id: 'know_power_shutoff',
    category: 'utilities',
    weight: 10,
    labelKey: 'homeSafety.items.knowPowerShutoff',
  },
];

function categoryLabel(category: KitItemCategory, t: (key: string) => string): string {
  switch (category) {
    case 'essential':
      return t('kit.categories.essential');
    case 'useful':
      return t('kit.categories.useful');
    case 'unnecessary':
      return t('kit.categories.unnecessary');
    case 'unsafe':
      return t('kit.categories.unsafe');
    default:
      return category;
  }
}

function quizCategoryLabel(category: QuizCategory, t: (key: string) => string): string {
  return t(`quiz.categories.${category}`);
}

function homeCategoryLabel(category: HomeSafetyCategory, t: (key: string) => string): string {
  return t(`homeSafety.categories.${category}`);
}

type TasksScreenProps = {
  onOpenSettings: () => void;
};

export function TasksScreen({ onOpenSettings }: TasksScreenProps) {
  const { t } = useI18n();
  const { profile, addXp, updateModuleScore } = usePreparedness();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [kitBestScore, setKitBestScore] = useState(0);
  const [kitAttempts, setKitAttempts] = useState(0);
  const [kitModalVisible, setKitModalVisible] = useState(false);
  const [kitModalStep, setKitModalStep] = useState<KitModalStep>('build');
  const [kitLastResult, setKitLastResult] = useState<ReturnType<
    typeof evaluateKitSelection
  > | null>(null);

  const [quizBestScore, setQuizBestScore] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [completedQuizCategories, setCompletedQuizCategories] = useState<Set<QuizCategory>>(
    new Set(),
  );
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [quizModalStep, setQuizModalStep] = useState<QuizModalStep>('question');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizHeartsRemaining, setQuizHeartsRemaining] = useState(QUIZ_START_HEARTS);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizFeedback, setQuizFeedback] = useState<{
    isCorrect: boolean;
    explanationKey: string;
  } | null>(null);
  const [quizResult, setQuizResult] = useState<ReturnType<typeof computeQuizResult> | null>(null);
  const [lastMasteredCategories, setLastMasteredCategories] = useState<QuizCategory[]>([]);

  const [homeBestScore, setHomeBestScore] = useState(0);
  const [homeAttempts, setHomeAttempts] = useState(0);
  const [homeModalVisible, setHomeModalVisible] = useState(false);
  const [homeModalStep, setHomeModalStep] = useState<HomeModalStep>('checklist');
  const [completedHomeIds, setCompletedHomeIds] = useState<Set<string>>(new Set());
  const [homeEvaluation, setHomeEvaluation] = useState<ReturnType<
    typeof evaluateHomeSafety
  > | null>(null);
  const [homeRecommendations, setHomeRecommendations] = useState<HomeSafetyChecklistItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const [kitProgress, quizProgress, homeProgress] = await Promise.all([
        loadKitProgress(),
        loadQuizProgress(),
        loadHomeSafetyProgress(),
      ]);
      if (cancelled) return;

      if (kitProgress) {
        setKitBestScore(kitProgress.bestScore);
        setKitAttempts(kitProgress.attempts);
      }

      if (quizProgress) {
        setQuizBestScore(quizProgress.bestScore);
        setQuizAttempts(quizProgress.attempts);
        setCompletedQuizCategories(new Set(quizProgress.completedCategories));
      }

      if (homeProgress) {
        setHomeBestScore(homeProgress.bestScore);
        setHomeAttempts(homeProgress.attempts);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedCount = selectedIds.size;
  const selectedItems = useMemo(
    () => KIT_ITEMS.filter((item) => selectedIds.has(item.id)),
    [selectedIds],
  );
  const activeQuestion = QUIZ_QUESTIONS[quizIndex];
  const homeCompletedCount = completedHomeIds.size;

  const closeKitModal = () => {
    setKitModalVisible(false);
  };

  const openKitModal = () => {
    setKitModalStep('build');
    setKitModalVisible(true);
  };

  const toggleItem = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onEvaluateKit = async () => {
    const result = evaluateKitSelection(KIT_ITEMS, selectedIds);
    setKitLastResult(result);
    setKitModalStep('result');

    const nextAttempts = kitAttempts + 1;
    const improved = result.score > kitBestScore;
    const nextBest = improved ? result.score : kitBestScore;

    setKitBestScore(nextBest);
    setKitAttempts(nextAttempts);

    const xp = xpForKitScore(result.score);
    addXp(xp, 'kit_session_completed');

    if (improved) {
      addXp(10, 'kit_high_score_improved');
    }

    const moduleScore = Math.max(profile.moduleScores.kit, result.score);
    updateModuleScore('kit', moduleScore, 'kit_session_completed');

    await saveKitProgress({
      bestScore: nextBest,
      attempts: nextAttempts,
      lastPlayedAt: new Date().toISOString(),
    });
  };

  const onRetryKit = () => {
    setKitModalStep('build');
  };

  const closeQuizModal = () => {
    setQuizModalVisible(false);
  };

  const openQuizModal = () => {
    setQuizModalVisible(true);
    setQuizModalStep('question');
    setQuizIndex(0);
    setQuizHeartsRemaining(QUIZ_START_HEARTS);
    setQuizAnswers({});
    setQuizFeedback(null);
    setQuizResult(null);
    setLastMasteredCategories([]);
  };

  const onSelectQuizOption = (optionId: string) => {
    if (quizModalStep !== 'question' || !activeQuestion) return;

    const verdict = evaluateAnswer(activeQuestion, optionId);
    const nextHearts = verdict.isCorrect
      ? quizHeartsRemaining
      : Math.max(0, quizHeartsRemaining - 1);

    setQuizAnswers((current) => ({
      ...current,
      [activeQuestion.id]: optionId,
    }));
    setQuizHeartsRemaining(nextHearts);
    setQuizFeedback(verdict);
    setQuizModalStep('feedback');
  };

  const finalizeQuiz = async () => {
    const result = computeQuizResult(
      QUIZ_QUESTIONS,
      quizAnswers,
      QUIZ_START_HEARTS,
      quizHeartsRemaining,
    );
    setQuizResult(result);
    setQuizModalStep('result');

    const nextAttempts = quizAttempts + 1;
    const improved = result.percentage > quizBestScore;
    const nextBest = improved ? result.percentage : quizBestScore;

    const mastered = masteredCategories(QUIZ_QUESTIONS, quizAnswers);
    const newlyMastered = mastered.filter((category) => !completedQuizCategories.has(category));
    const nextCompleted = new Set([...completedQuizCategories, ...mastered]);

    setQuizBestScore(nextBest);
    setQuizAttempts(nextAttempts);
    setCompletedQuizCategories(nextCompleted);
    setLastMasteredCategories(newlyMastered);

    const xp = xpForQuizResult(result);
    addXp(xp, 'quiz_session_completed');

    if (improved) {
      addXp(10, 'quiz_high_score_improved');
    }

    if (newlyMastered.length) {
      addXp(newlyMastered.length * 10, 'quiz_category_completed');
    }

    const moduleScore = Math.max(profile.moduleScores.quiz, result.percentage);
    updateModuleScore('quiz', moduleScore, 'quiz_session_completed');

    await saveQuizProgress({
      bestScore: nextBest,
      attempts: nextAttempts,
      completedCategories: Array.from(nextCompleted),
      lastPlayedAt: new Date().toISOString(),
    });
  };

  const onContinueQuiz = () => {
    if (quizModalStep !== 'feedback') return;

    const isEnd = quizIndex >= QUIZ_QUESTIONS.length - 1;
    if (quizHeartsRemaining <= 0 || isEnd) {
      void finalizeQuiz();
      return;
    }

    setQuizIndex((current) => current + 1);
    setQuizFeedback(null);
    setQuizModalStep('question');
  };

  const closeHomeModal = () => {
    setHomeModalVisible(false);
  };

  const openHomeModal = () => {
    setHomeModalVisible(true);
    setHomeModalStep('checklist');
  };

  const toggleHomeItem = (id: string) => {
    setCompletedHomeIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const onEvaluateHome = async () => {
    const result = evaluateHomeSafety(HOME_SAFETY_ITEMS, completedHomeIds);
    const recommendations = topHomeSafetyRecommendations(HOME_SAFETY_ITEMS, completedHomeIds, 3);

    setHomeEvaluation(result);
    setHomeRecommendations(recommendations);
    setHomeModalStep('result');

    const nextAttempts = homeAttempts + 1;
    const improved = result.score > homeBestScore;
    const nextBest = improved ? result.score : homeBestScore;

    setHomeBestScore(nextBest);
    setHomeAttempts(nextAttempts);

    const xp = xpForHomeSafetyScore(result.score);
    addXp(xp, 'home_assessment_completed');

    if (improved) {
      addXp(10, 'home_score_improved');
    }

    const moduleScore = Math.max(profile.moduleScores.home, result.score);
    updateModuleScore('home', moduleScore, 'home_assessment_completed');

    await saveHomeSafetyProgress({
      bestScore: nextBest,
      attempts: nextAttempts,
      lastAssessmentAt: new Date().toISOString(),
    });
  };

  const onRetryHome = () => {
    setHomeModalStep('checklist');
  };

  return (
    <ScreenScaffold
      title={t('tasks.title')}
      subtitle={t('tasks.subtitle')}
      onOpenSettings={onOpenSettings}
      settingsA11yLabel={t('settings.open')}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <AppText variant="subtitle">{t('kit.builderTitle')}</AppText>
          <AppText variant="caption" muted>
            {t('kit.builderDescription')}
          </AppText>
          <View style={styles.statsRow}>
            <Pill label={t('kit.bestScore', { score: kitBestScore })} />
            <Pill label={t('kit.attempts', { count: kitAttempts })} />
            <Pill label={t('kit.selectedCount', { count: selectedCount })} />
          </View>
          <AppButton label={t('kit.openBuilder')} onPress={openKitModal} />
        </Card>

        <Card>
          <AppText variant="subtitle">{t('quiz.title')}</AppText>
          <AppText variant="caption" muted>
            {t('quiz.description')}
          </AppText>
          <View style={styles.statsRow}>
            <Pill label={t('quiz.bestScore', { score: quizBestScore })} />
            <Pill label={t('quiz.attempts', { count: quizAttempts })} />
            <Pill
              label={t('quiz.categoriesCompleted', {
                count: completedQuizCategories.size,
              })}
            />
          </View>
          <AppButton label={t('quiz.openQuiz')} onPress={openQuizModal} />
        </Card>

        <Card>
          <AppText variant="subtitle">{t('homeSafety.title')}</AppText>
          <AppText variant="caption" muted>
            {t('homeSafety.description')}
          </AppText>
          <View style={styles.statsRow}>
            <Pill label={t('homeSafety.bestScore', { score: homeBestScore })} />
            <Pill label={t('homeSafety.attempts', { count: homeAttempts })} />
            <Pill label={t('homeSafety.completedCount', { count: homeCompletedCount })} />
          </View>
          <AppButton label={t('homeSafety.openInspector')} onPress={openHomeModal} />
        </Card>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={kitModalVisible}
        onRequestClose={closeKitModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">{t('kit.builderTitle')}</AppText>
              <AppButton label={t('kit.backToTasks')} onPress={closeKitModal} />
            </View>

            {kitModalStep === 'build' ? (
              <>
                <AppText variant="caption" muted>
                  {t('kit.chooseItems')}
                </AppText>
                <ScrollView contentContainerStyle={styles.itemsWrap}>
                  {KIT_ITEMS.map((item) => {
                    const selected = selectedIds.has(item.id);
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => toggleItem(item.id)}
                        style={[styles.itemChip, selected ? styles.itemChipSelected : null]}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={t('kit.selectItemA11y', {
                          item: t(item.labelKey),
                          category: categoryLabel(item.category, t),
                        })}
                      >
                        <AppText variant="caption" muted={!selected}>
                          {t(item.labelKey)}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.actionsRow}>
                  <AppButton
                    label={t('kit.evaluate')}
                    onPress={() => {
                      void onEvaluateKit();
                    }}
                    disabled={selectedCount === 0}
                    accessibilityHint={
                      selectedCount === 0 ? t('kit.evaluateDisabledHint') : undefined
                    }
                  />
                </View>
              </>
            ) : null}

            {kitModalStep === 'result' && kitLastResult ? (
              <ScrollView contentContainerStyle={styles.resultContent}>
                <AppText variant="subtitle">
                  {t('kit.resultTitle', {
                    score: kitLastResult.score,
                    stars: kitLastResult.stars,
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('kit.resultMeta', {
                    points: kitLastResult.points,
                    max: kitLastResult.maxPoints,
                    missed: kitLastResult.missedEssentialCount,
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('kit.xpReward', { xp: xpForKitScore(kitLastResult.score) })}
                </AppText>

                <AppText variant="subtitle">{t('kit.feedbackTitle')}</AppText>
                {selectedItems.length ? (
                  selectedItems.map((item) => (
                    <AppText key={item.id} variant="caption" muted>
                      • {t(item.feedbackKey)}
                    </AppText>
                  ))
                ) : (
                  <AppText variant="caption" muted>
                    {t('kit.feedbackEmpty')}
                  </AppText>
                )}

                <View style={styles.actionsRow}>
                  <AppButton label={t('kit.retry')} onPress={onRetryKit} />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={quizModalVisible}
        onRequestClose={closeQuizModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">{t('quiz.title')}</AppText>
              <AppButton label={t('quiz.backToTasks')} onPress={closeQuizModal} />
            </View>

            {quizModalStep === 'question' && activeQuestion ? (
              <>
                <View style={styles.statsRow}>
                  <Pill
                    label={t('quiz.questionProgress', {
                      current: quizIndex + 1,
                      total: QUIZ_QUESTIONS.length,
                    })}
                  />
                  <Pill label={t('quiz.hearts', { value: quizHeartsRemaining })} />
                </View>
                <Card>
                  <AppText variant="subtitle">{t(activeQuestion.promptKey)}</AppText>
                  <View style={styles.optionsWrap}>
                    {activeQuestion.options.map((option) => (
                      <Pressable
                        key={option.id}
                        onPress={() => onSelectQuizOption(option.id)}
                        style={styles.optionButton}
                        accessibilityRole="button"
                        accessibilityLabel={t('quiz.selectOptionA11y', {
                          option: t(option.labelKey),
                        })}
                      >
                        <AppText>{t(option.labelKey)}</AppText>
                      </Pressable>
                    ))}
                  </View>
                </Card>
              </>
            ) : null}

            {quizModalStep === 'feedback' && quizFeedback ? (
              <Card>
                <AppText variant="subtitle">
                  {quizFeedback.isCorrect ? t('quiz.correct') : t('quiz.incorrect')}
                </AppText>
                <AppText variant="caption" muted>
                  {t(quizFeedback.explanationKey)}
                </AppText>
                <AppButton
                  label={
                    quizHeartsRemaining <= 0 || quizIndex >= QUIZ_QUESTIONS.length - 1
                      ? t('quiz.finishQuiz')
                      : t('quiz.nextQuestion')
                  }
                  onPress={onContinueQuiz}
                />
              </Card>
            ) : null}

            {quizModalStep === 'result' && quizResult ? (
              <ScrollView contentContainerStyle={styles.resultContent}>
                <AppText variant="subtitle">
                  {t('quiz.resultTitle', {
                    score: quizResult.percentage,
                    correct: quizResult.correctCount,
                    total: quizResult.total,
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('quiz.resultMeta', {
                    mistakes: quizResult.mistakes,
                    hearts: quizResult.heartsRemaining,
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('quiz.xpReward', { xp: xpForQuizResult(quizResult) })}
                </AppText>

                {lastMasteredCategories.length ? (
                  <>
                    <AppText variant="subtitle">{t('quiz.masteredTitle')}</AppText>
                    <View style={styles.statsRow}>
                      {lastMasteredCategories.map((category) => (
                        <Pill key={category} label={quizCategoryLabel(category, t)} />
                      ))}
                    </View>
                  </>
                ) : null}

                <View style={styles.actionsRow}>
                  <AppButton label={t('quiz.retry')} onPress={openQuizModal} />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={homeModalVisible}
        onRequestClose={closeHomeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">{t('homeSafety.title')}</AppText>
              <AppButton label={t('homeSafety.backToTasks')} onPress={closeHomeModal} />
            </View>

            {homeModalStep === 'checklist' ? (
              <>
                <AppText variant="caption" muted>
                  {t('homeSafety.checklistTitle')}
                </AppText>
                <ScrollView contentContainerStyle={styles.optionsWrap}>
                  {HOME_SAFETY_ITEMS.map((item) => {
                    const checked = completedHomeIds.has(item.id);
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => toggleHomeItem(item.id)}
                        style={[styles.optionButton, checked ? styles.itemChipSelected : null]}
                        accessibilityRole="button"
                        accessibilityState={{ selected: checked }}
                        accessibilityLabel={t('homeSafety.selectItemA11y', {
                          item: t(item.labelKey),
                          category: homeCategoryLabel(item.category, t),
                        })}
                      >
                        <AppText>{t(item.labelKey)}</AppText>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={styles.actionsRow}>
                  <AppButton
                    label={t('homeSafety.evaluate')}
                    onPress={() => void onEvaluateHome()}
                  />
                </View>
              </>
            ) : null}

            {homeModalStep === 'result' && homeEvaluation ? (
              <ScrollView contentContainerStyle={styles.resultContent}>
                <AppText variant="subtitle">
                  {t('homeSafety.resultTitle', {
                    score: homeEvaluation.score,
                    risk: t(`homeSafety.riskTier.${homeEvaluation.riskTier}`),
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('homeSafety.resultMeta', {
                    completed: homeEvaluation.completedWeight,
                    total: homeEvaluation.totalWeight,
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('homeSafety.xpReward', {
                    xp: xpForHomeSafetyScore(homeEvaluation.score),
                  })}
                </AppText>

                <AppText variant="subtitle">{t('homeSafety.categoryScoresTitle')}</AppText>
                {(Object.keys(homeEvaluation.categoryScores) as HomeSafetyCategory[]).map(
                  (category) => (
                    <AppText key={category} variant="caption" muted>
                      {t('homeSafety.categoryScoreLine', {
                        category: homeCategoryLabel(category, t),
                        value: homeEvaluation.categoryScores[category],
                      })}
                    </AppText>
                  ),
                )}

                <AppText variant="subtitle">{t('homeSafety.recommendationsTitle')}</AppText>
                {homeRecommendations.length ? (
                  homeRecommendations.map((item) => (
                    <AppText key={item.id} variant="caption" muted>
                      • {t(item.labelKey)}
                    </AppText>
                  ))
                ) : (
                  <AppText variant="caption" muted>
                    {t('homeSafety.recommendationsEmpty')}
                  </AppText>
                )}

                <View style={styles.actionsRow}>
                  <AppButton label={t('homeSafety.retry')} onPress={onRetryHome} />
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: theme.spacing.md,
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  itemsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  itemChip: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  itemChipSelected: {
    backgroundColor: theme.colors.brandSoft,
    borderColor: theme.colors.brand,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  resultContent: {
    gap: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  optionsWrap: {
    gap: theme.spacing.xs,
  },
  optionButton: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
});

import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { AppText } from '../components/ui/AppText';
import { Card } from '../components/ui/Card';
import { Pill } from '../components/ui/Pill';
import { usePreparedness } from '../gamification/preparedness.context';
import {
  evaluateKitSelection,
  xpForKitScore,
  type KitItemCategory,
  type KitItemDefinition,
} from '../gamification/kit.logic';
import { loadKitProgress, saveKitProgress } from '../gamification/kit.storage';
import { useI18n } from '../i18n';
import { ScreenScaffold } from './ScreenScaffold';
import { theme } from '../theme/theme';

type KitItem = KitItemDefinition & {
  labelKey: string;
  feedbackKey: string;
};

type KitModalStep = 'build' | 'result';

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

export function TasksScreen() {
  const { t } = useI18n();
  const { profile, addXp, updateModuleScore } = usePreparedness();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bestScore, setBestScore] = useState<number>(0);
  const [attempts, setAttempts] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalStep, setModalStep] = useState<KitModalStep>('build');
  const [lastResult, setLastResult] = useState<ReturnType<typeof evaluateKitSelection> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const progress = await loadKitProgress();
      if (!progress || cancelled) return;
      setBestScore(progress.bestScore);
      setAttempts(progress.attempts);
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

  const closeModal = () => {
    setModalVisible(false);
  };

  const openBuilderModal = () => {
    setModalStep('build');
    setModalVisible(true);
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

  const onEvaluate = async () => {
    const result = evaluateKitSelection(KIT_ITEMS, selectedIds);
    setLastResult(result);
    setModalStep('result');

    const nextAttempts = attempts + 1;
    const improved = result.score > bestScore;
    const nextBest = improved ? result.score : bestScore;

    setBestScore(nextBest);
    setAttempts(nextAttempts);

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

  const onRetry = () => {
    setModalStep('build');
  };

  return (
    <ScreenScaffold title={t('tasks.title')} subtitle={t('tasks.subtitle')}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card>
          <AppText variant="subtitle">{t('kit.builderTitle')}</AppText>
          <AppText variant="caption" muted>
            {t('kit.builderDescription')}
          </AppText>
          <View style={styles.statsRow}>
            <Pill label={t('kit.bestScore', { score: bestScore })} />
            <Pill label={t('kit.attempts', { count: attempts })} />
            <Pill label={t('kit.selectedCount', { count: selectedCount })} />
          </View>
          <AppButton label={t('kit.openBuilder')} onPress={openBuilderModal} />
        </Card>
      </ScrollView>

      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <AppText variant="subtitle">{t('kit.builderTitle')}</AppText>
              <AppButton label={t('kit.backToTasks')} onPress={closeModal} />
            </View>

            {modalStep === 'build' ? (
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
                      void onEvaluate();
                    }}
                    disabled={selectedCount === 0}
                    accessibilityHint={
                      selectedCount === 0 ? t('kit.evaluateDisabledHint') : undefined
                    }
                  />
                </View>
              </>
            ) : null}

            {modalStep === 'result' && lastResult ? (
              <ScrollView contentContainerStyle={styles.resultContent}>
                <AppText variant="subtitle">
                  {t('kit.resultTitle', {
                    score: lastResult.score,
                    stars: lastResult.stars,
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('kit.resultMeta', {
                    points: lastResult.points,
                    max: lastResult.maxPoints,
                    missed: lastResult.missedEssentialCount,
                  })}
                </AppText>
                <AppText variant="caption" muted>
                  {t('kit.xpReward', { xp: xpForKitScore(lastResult.score) })}
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
                  <AppButton label={t('kit.retry')} onPress={onRetry} />
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
});

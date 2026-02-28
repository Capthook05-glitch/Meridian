import type { ReviewQuality, ReviewStatus, SM2Result } from '@/types'

/**
 * SM-2 Spaced Repetition Algorithm
 * @param quality - Review quality (0-5): 0=blackout, 1=incorrect, 2=incorrect easy, 3=correct hard, 4=correct, 5=perfect
 * @param repetitions - Number of times this card has been reviewed
 * @param easeFactor - Current ease factor (starts at 2.5)
 * @param intervalDays - Current interval in days
 */
export function calculateSM2(
  quality: ReviewQuality,
  repetitions: number,
  easeFactor: number,
  intervalDays: number
): SM2Result {
  let newEaseFactor = easeFactor
  let newInterval: number
  let newReps: number
  let newStatus: ReviewStatus

  if (quality < 3) {
    // Incorrect: reset
    newInterval = 1
    newReps = 0
    newStatus = 'relearning'
  } else {
    // Correct: update ease factor
    newEaseFactor = Math.max(
      1.3,
      easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    )

    newReps = repetitions + 1

    if (newReps === 1) {
      newInterval = 1
      newStatus = 'learning'
    } else if (newReps === 2) {
      newInterval = 6
      newStatus = 'learning'
    } else {
      newInterval = Math.round(intervalDays * newEaseFactor)
      newStatus = 'review'
    }
  }

  if (newReps > 10) {
    newStatus = 'graduated'
  }

  return {
    new_interval: newInterval,
    new_ease_factor: newEaseFactor,
    new_repetitions: newReps,
    new_status: newStatus,
  }
}

export function getNextReviewDate(intervalDays: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + intervalDays)
  return date
}

export const QUALITY_LABELS: Record<number, { label: string; color: string; description: string }> = {
  0: { label: 'Blackout', color: '#EF4444', description: "Complete blank, didn't remember at all" },
  1: { label: 'Wrong', color: '#F97316', description: 'Incorrect, but saw the answer' },
  2: { label: 'Again', color: '#EAB308', description: 'Incorrect, but easy to recall now' },
  3: { label: 'Hard', color: '#6366F1', description: 'Correct with significant difficulty' },
  4: { label: 'Good', color: '#10B981', description: 'Correct after hesitation' },
  5: { label: 'Easy', color: '#22C55E', description: 'Perfect recall with no hesitation' },
}

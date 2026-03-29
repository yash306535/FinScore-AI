import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { demoAnswers, questions } from '../data/questions';
import { useQuiz } from '../hooks/useQuiz';
import { useQuizStore } from '../store/quizStore';
import { ToastState } from '../types';
import { QuizShell } from '../components/quiz/QuizShell';
import { QuizStep } from '../components/quiz/QuizStep';
import { QuizSummary } from '../components/quiz/QuizSummary';
import { Button } from '../components/ui/Button';
import { Toast } from '../components/ui/Toast';

const thinkingMessages = [
  'Analysing your emergency fund',
  'Reviewing your insurance coverage',
  'Evaluating your investment strategy',
  'Checking your debt situation',
  'Examining your tax planning',
  'Assessing your retirement readiness',
  'Generating your 12-month action plan',
  'Almost ready preparing your results'
];

const ThinkingOverlay = ({ active }: { active: boolean }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setMessageIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setMessageIndex((current) => Math.min(current + 1, thinkingMessages.length - 1));
    }, 2000);

    return () => window.clearInterval(interval);
  }, [active]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/95 px-6"
        >
          <div className="w-full max-w-xl text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-amber/15 text-amber">
              <BrainCircuit className="h-10 w-10 animate-pulse" />
            </div>
            <h2 className="mt-8 font-display text-3xl font-bold text-white">{thinkingMessages[messageIndex]}</h2>
            <p className="mt-3 text-muted">Our AI is building your personalized Money Health Score report.</p>
            <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <motion.div
                className="h-full rounded-full bg-amber"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 8, ease: 'linear' }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export const Quiz = () => {
  const navigate = useNavigate();
  const {
    answerQuestion,
    currentQuestion,
    currentStep,
    dimensionCounts,
    fillDemo,
    goBackToLastQuestion,
    goToReview,
    isReviewStep,
    prevStep,
    progress,
    quizAnswers,
    submitQuiz,
    user
  } = useQuiz();
  const [incomeInput, setIncomeInput] = useState(user?.income ? String(user.income) : '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [toast, setToast] = useState<ToastState>({ open: false, message: '' });

  useEffect(() => {
    if (user?.income && !incomeInput) {
      setIncomeInput(String(user.income));
    }
  }, [incomeInput, user?.income]);

  useEffect(() => {
    if (window.localStorage.getItem('mhs_demo_pending') === 'true') {
      useQuizStore.setState({
        quizAnswers: demoAnswers,
        currentStep: questions.length
      });
      setIncomeInput(String(user?.income || 65000));
      window.localStorage.removeItem('mhs_demo_pending');
    }
  }, [user?.income]);

  const selectedValue = currentQuestion ? quizAnswers[currentQuestion.id] : undefined;
  const incomeRequired = !user?.income;

  const headerMeta = useMemo(() => {
    if (isReviewStep || !currentQuestion) {
      return {
        title: 'Final Review',
        icon: Sparkles,
        step: questions.length,
        total: questions.length,
        progress: 100
      };
    }

    return {
      title: currentQuestion.dimensionLabel,
      icon: currentQuestion.icon,
      step: currentStep + 1,
      total: questions.length,
      progress
    };
  }, [currentQuestion, currentStep, isReviewStep, progress]);

  const handleSubmit = async () => {
    if (Object.keys(quizAnswers).length < questions.length) {
      setToast({ open: true, message: 'Please answer all questions before submitting.', variant: 'error' });
      return;
    }

    const numericIncome = user?.income || Number(incomeInput);

    if (!numericIncome || Number.isNaN(numericIncome)) {
      setToast({ open: true, message: 'Please add your monthly income to generate the action plan.', variant: 'error' });
      return;
    }

    setIsSubmitting(true);
    setShowOverlay(true);

    try {
      const [result] = await Promise.all([
        submitQuiz(numericIncome),
        new Promise((resolve) => window.setTimeout(resolve, 8000))
      ]);

      navigate(`/results/${result.id}`);
    } catch (error) {
      setToast({ open: true, message: 'We could not generate your score right now. Please try again.', variant: 'error' });
      setShowOverlay(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Toast {...toast} onClose={() => setToast({ open: false, message: '', variant: 'info' })} />
      <ThinkingOverlay active={showOverlay} />
      <QuizShell
        title={headerMeta.title}
        icon={headerMeta.icon}
        step={headerMeta.step}
        total={headerMeta.total}
        progress={headerMeta.progress}
      >
        {!isReviewStep && currentQuestion ? (
          <AnimatePresence mode="wait">
            <QuizStep
              key={currentQuestion.id}
              question={currentQuestion}
              selectedValue={selectedValue}
              isLast={currentStep === questions.length - 1}
              canGoBack={currentStep > 0}
              onSelect={(value) => answerQuestion(currentQuestion.id, value)}
              onBack={prevStep}
              onReview={goToReview}
            />
          </AnimatePresence>
        ) : (
          <QuizSummary
            counts={dimensionCounts}
            income={incomeInput}
            incomeRequired={incomeRequired}
            isSubmitting={isSubmitting}
            onIncomeChange={setIncomeInput}
            onBack={goBackToLastQuestion}
            onSubmit={() => void handleSubmit()}
          />
        )}
      </QuizShell>

      {!showOverlay ? (
        <div className="fixed bottom-6 right-6 z-40">
          <Button
            variant="outline"
            className="rounded-full border-amber/30 bg-card/90 px-5 py-3 text-amber shadow-xl"
            onClick={() => {
              fillDemo();
              setIncomeInput(String(user?.income || 65000));
            }}
          >
            Demo Fill
          </Button>
        </div>
      ) : null}
    </>
  );
};

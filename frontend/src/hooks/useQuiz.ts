import { useMemo } from 'react';

import { demoAnswers, questions } from '../data/questions';
import { submitQuizRequest } from '../services/quiz.service';
import { useQuizStore } from '../store/quizStore';

export const useQuiz = () => {
  const quizAnswers = useQuizStore((state) => state.quizAnswers);
  const currentStep = useQuizStore((state) => state.currentStep);
  const setAnswer = useQuizStore((state) => state.setAnswer);
  const nextStep = useQuizStore((state) => state.nextStep);
  const prevStep = useQuizStore((state) => state.prevStep);
  const setLoading = useQuizStore((state) => state.setLoading);
  const setScoreResult = useQuizStore((state) => state.setScoreResult);
  const user = useQuizStore((state) => state.user);

  const isReviewStep = currentStep >= questions.length;
  const currentQuestion = isReviewStep ? null : questions[currentStep];

  const answeredCount = Object.keys(quizAnswers).length;
  const progress = Math.min((answeredCount / questions.length) * 100, 100);

  const dimensionCounts = useMemo(
    () =>
      questions.reduce<Record<string, { total: number; answered: number }>>((accumulator, question) => {
        const bucket = accumulator[question.dimension] || { total: 0, answered: 0 };
        bucket.total += 1;
        bucket.answered += quizAnswers[question.id] ? 1 : 0;
        accumulator[question.dimension] = bucket;
        return accumulator;
      }, {}),
    [quizAnswers]
  );

  const answerQuestion = (questionId: string, value: string) => {
    setAnswer(questionId, value);

    if (currentStep < questions.length - 1) {
      window.setTimeout(() => {
        useQuizStore.getState().nextStep();
      }, 180);
    }
  };

  const goToReview = () => {
    useQuizStore.setState({ currentStep: questions.length });
  };

  const goBackToLastQuestion = () => {
    useQuizStore.setState({ currentStep: questions.length - 1 });
  };

  const fillDemo = () => {
    useQuizStore.setState({
      quizAnswers: demoAnswers,
      currentStep: questions.length
    });
  };

  const submitQuiz = async (income: number) => {
    setLoading(true);

    try {
      const scoreResult = await submitQuizRequest(quizAnswers, income);
      setScoreResult(scoreResult);
      return scoreResult;
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    user,
    quizAnswers,
    currentStep,
    currentQuestion,
    progress,
    answeredCount,
    isReviewStep,
    dimensionCounts,
    answerQuestion,
    nextStep,
    prevStep,
    goToReview,
    goBackToLastQuestion,
    fillDemo,
    submitQuiz
  };
};

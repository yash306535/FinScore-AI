import {
  getLatestScoreRequest,
  getScoreByIdRequest,
  getScoreHistoryRequest
} from '../services/quiz.service';
import { useQuizStore } from '../store/quizStore';

export const useScore = () => {
  const setScoreResult = useQuizStore((state) => state.setScoreResult);

  const getLatestScore = async () => {
    const score = await getLatestScoreRequest();
    setScoreResult(score);
    return score;
  };

  const getScoreById = async (id: string) => {
    const score = await getScoreByIdRequest(id);
    setScoreResult(score);
    return score;
  };

  const getScoreHistory = async () => getScoreHistoryRequest();

  return {
    getLatestScore,
    getScoreById,
    getScoreHistory
  };
};

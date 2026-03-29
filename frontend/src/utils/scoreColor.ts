export const getScoreTone = (score: number): 'success' | 'warning' | 'danger' => {
  if (score >= 70) {
    return 'success';
  }

  if (score >= 40) {
    return 'warning';
  }

  return 'danger';
};

export const getScoreColorClass = (score: number): string => {
  const tone = getScoreTone(score);

  if (tone === 'success') {
    return 'text-success';
  }

  if (tone === 'warning') {
    return 'text-warning';
  }

  return 'text-danger';
};

export const getScoreBgClass = (score: number): string => {
  const tone = getScoreTone(score);

  if (tone === 'success') {
    return 'bg-success/15 text-success border-success/30';
  }

  if (tone === 'warning') {
    return 'bg-amber/15 text-amber border-amber/30';
  }

  return 'bg-danger/15 text-danger border-danger/30';
};

export const getGrade = (score: number): string => {
  if (score >= 85) {
    return 'A+';
  }

  if (score >= 70) {
    return 'A';
  }

  if (score >= 55) {
    return 'B';
  }

  if (score >= 40) {
    return 'C';
  }

  if (score >= 20) {
    return 'D';
  }

  return 'F';
};

export const getBenchmarkText = (score: number): string => {
  if (score >= 85) {
    return 'You are in the top 5 percent of financially aware Indians in your age group.';
  }

  if (score >= 70) {
    return 'You are in the top 15 percent of financially aware Indians in your age group.';
  }

  if (score >= 55) {
    return 'You are in the top 35 percent of financially aware Indians in your age group.';
  }

  if (score >= 40) {
    return 'You are in the top 55 percent of financially aware Indians in your age group.';
  }

  return 'You are in the bottom 30 percent of financially aware Indians in your age group.';
};

interface LoaderProps {
  label?: string;
  fullScreen?: boolean;
}

export const Loader = ({ label = 'Loading your money dashboard...', fullScreen = false }: LoaderProps) => {
  const content = (
    <div className="flex flex-col items-center gap-4 text-center text-white">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-amber" />
      <p className="text-sm text-muted">{label}</p>
    </div>
  );

  if (fullScreen) {
    return <div className="flex min-h-screen items-center justify-center bg-navy">{content}</div>;
  }

  return content;
};

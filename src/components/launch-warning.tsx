type LaunchWarningProps = {
  message: string;
};

export function LaunchWarning({ message }: LaunchWarningProps) {
  return (
    <div className="border-b border-amber-300/60 bg-amber-100/90 px-4 py-3 text-sm text-amber-950">
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-amber-500 font-bold text-white">
          !
        </span>
        <p>{message}</p>
      </div>
    </div>
  );
}

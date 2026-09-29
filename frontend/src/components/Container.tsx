export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <div className="flex w-full max-w-sm cursor-default items-center justify-center">
        {children}
      </div>
    </div>
  );
}

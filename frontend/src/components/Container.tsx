export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh w-full flex justify-center items-center">
      <div className="w-full max-w-sm flex items-center justify-center p-4 cursor-default">
        {children}
      </div>
    </div>
  );
}

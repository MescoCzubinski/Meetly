export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full flex justify-center items-center">
      <div className="w-full max-w-sm flex items-center justify-center cursor-default">
        {children}
      </div>
    </div>
  );
}

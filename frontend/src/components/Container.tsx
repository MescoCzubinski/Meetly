export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-[var(--color-bg)] ">
      <div className="w-full h-screen flex items-center justify-center p-4 max-w-[360px] cursor-default">
        {children}
      </div>
    </div>
  );
}

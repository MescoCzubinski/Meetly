export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-bg)] w-screen h-screen flex justify-center items-center">
      <div className="p-4 w-full max-w-[380px] md:max-w-none md:w-3/4 xl:w-1/4 cursor-default">
        {children}
      </div>
    </div>
  );
}

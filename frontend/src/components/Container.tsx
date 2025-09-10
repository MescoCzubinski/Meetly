export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[var(--color-bg)] w-screen h-screen flex justify-center items-center">
      <div className="p-4 w-full max-w-[380px] cursor-default">{children}</div>
    </div>
  );
}

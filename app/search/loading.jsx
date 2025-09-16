export default function Loading() {
  return (
    <main className="max-w-2xl mx-auto p-6 space-y-4">
      <div className="h-5 w-52 skeleton" />
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-xl border p-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full skeleton" />
            <div>
              <div className="h-4 w-40 skeleton" />
              <div className="h-3 w-24 skeleton mt-1" />
            </div>
          </div>
          <div className="h-8 w-20 skeleton rounded" />
        </div>
      ))}
    </main>
  );
}
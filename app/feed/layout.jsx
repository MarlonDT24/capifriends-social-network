import LeftSidebar from "@/components/feed/LeftSidebar";
import RightSidebar from "@/components/feed/RightSidebar";

// Layout solo para /feed: 3 columnas (izquierda, centro, derecha)
export default function FeedLayout({ children }) {
  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4">
      <aside className="lg:col-span-3 hidden lg:block">
        {/* izquierda */}
        <LeftSidebar />
      </aside>

      <section className="lg:col-span-6">
        {/* centro: el feed (children) */}
        {children}
      </section>

      <aside className="lg:col-span-3 hidden lg:block">
        {/* derecha */}
        <RightSidebar />
      </aside>
    </div>
  );
}

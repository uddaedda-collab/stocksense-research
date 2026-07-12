export function Footer() {
  return (
    <footer className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
      <p className="mx-auto max-w-3xl">
        StockSense Research is a free, independent educational research tool. It is not a SEBI-registered
        investment adviser and does not provide personalized investment advice. Market data is delayed and
        sourced from free public feeds. Always do your own research and consult a qualified financial adviser
        before investing.
      </p>
      <p className="mt-2">© {new Date().getFullYear()} StockSense Research. Built with free, open-source technology.</p>
    </footer>
  );
}

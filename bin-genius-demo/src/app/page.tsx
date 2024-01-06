import Main from "@/components/Main";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4">
      <h1 className="font-extrabold text-4xl">BinGenius</h1>

      <Main />

      <div className="fixed left-0 bottom-0 w-full py-2 items-center justify-center text-center whitespace-nowrap z-50">
        Less mess, no stress, BinGenius does the rest!
      </div>
    </main>
  );
}

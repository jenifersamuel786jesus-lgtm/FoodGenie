export default function Loader() {
  return (
    <div className="py-16 flex flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-800 rounded-full animate-spin" />
      <p className="text-sm text-stone-500 font-medium">
        Preparing kitchen catalog...
      </p>
    </div>
  );
}

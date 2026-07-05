export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <div role="alert" className="mt-5 rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-100">
      {message}
    </div>
  );
}

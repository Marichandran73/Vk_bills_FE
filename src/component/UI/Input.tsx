const Input = ({ label, type = "text" }: { label: string; type?: string }) => (
  <div>
    <label className="mb-2 block font-medium text-slate-700">{label}</label>
    <input
      type={type}
      className="w-full rounded-xl border border-slate-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
    />
  </div>
);

export default Input;

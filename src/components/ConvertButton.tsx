type Props = {
  onClick: () => void;
};

export default function ConvertButton({
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 rounded-lg bg-black text-white font-medium hover:bg-slate-800"
    >
      Convert
    </button>
  );
}
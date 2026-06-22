import { STATUS_COLORS } from "../types";

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}
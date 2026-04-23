import { L } from "../i18n.jsx";

export default function StatusBadge({ status }) {
  const cls = {
    paid: "badge-paid",
    unpaid: "badge-unpaid",
    partial: "badge-partial",
    vacant: "badge-vacant",
  }[status] || "badge-vacant";
  return <span className={`badge ${cls}`}><L k={status} /></span>;
}

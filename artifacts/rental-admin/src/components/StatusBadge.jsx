import { L } from "../i18n.jsx";
import { CheckCircle2, AlertCircle, Clock, Circle } from "lucide-react";

const conf = {
  paid: { cls: "badge-paid", Icon: CheckCircle2 },
  unpaid: { cls: "badge-unpaid", Icon: AlertCircle },
  partial: { cls: "badge-partial", Icon: Clock },
  vacant: { cls: "badge-vacant", Icon: Circle },
};

export default function StatusBadge({ status }) {
  const c = conf[status] || conf.vacant;
  const Icon = c.Icon;
  return <span className={`badge ${c.cls}`}><Icon size={12} /> <L k={status} /></span>;
}

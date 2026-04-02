import { AlertCircle } from "lucide-react";
import type { Notice } from "./types";

type AccountNoticeProps = {
  notice: Notice | null;
};

export default function AccountNotice({ notice }: AccountNoticeProps) {
  if (!notice) return null;

  return (
    <div className={`account-inline-notice ${notice.tone}`}>
      <AlertCircle size={16} />
      <span>{notice.text}</span>
    </div>
  );
}

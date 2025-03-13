import { useCallback } from "react";
import { atom, useSetAtom } from "../../editor-jotai";
import type React from "react";

export type OverwriteConfirmState =
  | {
      active: true;
      title: string;
      description: React.ReactNode;
      actionLabel: string;
      color: "danger" | "warning";

      onClose: () => void;
      onConfirm: () => void;
      onReject: () => void;
    }
  | { active: false };

export const overwriteConfirmStateAtom = atom<OverwriteConfirmState>({
  active: false,
});

export const useOpenConfirmModal = () => {
  const confirm = useSetAtom(overwriteConfirmStateAtom);
  return useCallback(
    async ({
      title,
      description,
      actionLabel,
      color,
    }: {
      title: string;
      description: React.ReactNode;
      actionLabel: string;
      color: "danger" | "warning";
    }) => {
      return new Promise<boolean>((resolve) => {
        confirm({
          active: true,
          onConfirm: () => resolve(true),
          onClose: () => resolve(false),
          onReject: () => resolve(false),
          title,
          description,
          actionLabel,
          color,
        });
      });
    },
    [confirm],
  );
};

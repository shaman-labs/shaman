'use client';

import { createContext, ReactNode, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BalanceItem } from '@covalenthq/client-sdk';
import { DialogBuyZug } from '@/components/dialog-buy-zug';
import { DialogAddBalance } from '@/components/dialog-add-balance';
import { DialogWithdrawBalance } from '@/components/dialog-withdraw-balance';
import { DialogDelete } from '@/components/dialog-delete';
import { DialogTrigger } from '@/components/dialog-trigger';
import { DialogTransferAsset } from '@/components/dialog-transfer-asset';
import { DialogViewLog } from '@/components/dialog-view-log';
import { DialogAddSpell } from '@/components/dialog-add-spell';
import { ShamanLogsTableData } from '@/types/shaman';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectOnClose?: string;
  onSuccess?: () => void;
  shamanId?: string;
  asset?: BalanceItem;
  shamanLog?: ShamanLogsTableData;
}

export type Dialogs = {
  buyZug: boolean;
  addBalance: boolean;
  withdrawBalance: boolean;
  transferAsset: boolean;
  delete: boolean;
  trigger: boolean;
  viewLog: boolean;
  addSpell: boolean;
  openBuyZug: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => void;
  openAddBalance: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => void;
  openWithdrawBalance: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => void;
  openDelete: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => void;
  openTrigger: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => void;
  openTransferAsset: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    asset?: BalanceItem
  ) => void;
  openViewLog: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    shamanLog?: ShamanLogsTableData
  ) => void;
  openAddSpell: (
    open: boolean,
    redirect?: string,
    onSuccess?: () => void,
    shamanId?: string
  ) => void;
};

const DialogContext = createContext<Dialogs>({
  buyZug: false,
  addBalance: false,
  withdrawBalance: false,
  transferAsset: false,
  delete: false,
  trigger: false,
  viewLog: false,
  addSpell: false,
  openBuyZug: () => {},
  openAddBalance: () => {},
  openWithdrawBalance: () => {},
  openDelete: () => {},
  openTrigger: () => {},
  openTransferAsset: () => {},
  openViewLog: () => {},
  openAddSpell: () => {},
});

type Props = {
  children: ReactNode;
};

export const DialogContextProvider = ({ children }: Props) => {
  const [buyZug, setBuyZug] = useState(false);
  const [addBalance, setAddBalance] = useState(false);
  const [withdrawBalance, setWithdrawBalance] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [transferAsset, setTransferAsset] = useState(false);
  const [viewLog, setViewLog] = useState(false);
  const [addSpell, setAddSpell] = useState(false);
  const [redirect, setRedirect] = useState<string | undefined>(undefined);
  const [onSuccess, setOnSuccess] = useState<() => void | undefined>();
  const [triggerDialog, setTriggerDialog] = useState(false);
  const [shamanId, setShamanId] = useState<string | undefined>(undefined);
  const [asset, setAsset] = useState<BalanceItem | undefined>(undefined);
  const [shamanLog, setShamanLog] = useState<ShamanLogsTableData | undefined>(
    undefined
  );
  const router = useRouter();

  const handleDialogClose = (open: boolean) => {
    if (!open && redirect) {
      router.push(redirect);
      setRedirect(undefined);
    }
  };

  const openBuyZug = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    shamanId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setShamanId(shamanId);
    }
    handleDialogClose(open);
    setBuyZug(open);
  };

  const openAddBalance = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    shamanId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setShamanId(shamanId);
    }
    handleDialogClose(open);
    setAddBalance(open);
  };

  const openWithdrawBalance = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    shamanId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setShamanId(shamanId);
    }
    handleDialogClose(open);
    setWithdrawBalance(open);
  };

  const openDelete = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    shamanId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setShamanId(shamanId);
    }
    handleDialogClose(open);
    setDeleteDialog(open);
  };

  const openTrigger = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    shamanId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setShamanId(shamanId);
    }
    handleDialogClose(open);
    setTriggerDialog(open);
  };

  const openTransferAsset = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    asset?: BalanceItem
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setAsset(asset);
    }
    handleDialogClose(open);
    setTransferAsset(open);
  };

  const openViewLog = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    shamanLog?: ShamanLogsTableData
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setShamanLog(shamanLog);
    }
    handleDialogClose(open);
    setViewLog(open);
  };

  const openAddSpell = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    shamanId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setShamanId(shamanId);
    }
    handleDialogClose(open);
    setAddSpell(open);
  };

  return (
    <DialogContext.Provider
      value={{
        buyZug,
        addBalance,
        withdrawBalance,
        transferAsset,
        delete: deleteDialog,
        trigger: triggerDialog,
        viewLog,
        addSpell,
        openBuyZug,
        openAddBalance,
        openWithdrawBalance,
        openDelete,
        openTrigger,
        openTransferAsset,
        openViewLog,
        openAddSpell,
      }}>
      {children}
      <DialogBuyZug
        open={buyZug}
        onOpenChange={openBuyZug}
        onSuccess={onSuccess}
      />
      <DialogAddBalance
        open={addBalance}
        onOpenChange={openAddBalance}
        onSuccess={onSuccess}
        shamanId={shamanId}
      />
      <DialogWithdrawBalance
        open={withdrawBalance}
        onOpenChange={openWithdrawBalance}
        onSuccess={onSuccess}
        shamanId={shamanId}
      />
      <DialogDelete
        open={deleteDialog}
        onOpenChange={openDelete}
        onSuccess={onSuccess}
        shamanId={shamanId}
      />
      <DialogTrigger
        open={triggerDialog}
        onOpenChange={openTrigger}
        onSuccess={onSuccess}
        shamanId={shamanId}
      />
      <DialogTransferAsset
        open={transferAsset}
        onOpenChange={openTransferAsset}
        onSuccess={onSuccess}
        asset={asset}
      />
      <DialogViewLog
        open={viewLog}
        onOpenChange={openViewLog}
        onSuccess={onSuccess}
        shamanLog={shamanLog}
      />
      <DialogAddSpell
        open={addSpell}
        onOpenChange={openAddSpell}
        onSuccess={onSuccess}
        shamanId={shamanId}
      />
    </DialogContext.Provider>
  );
};

export const useDialogContext = () => {
  return useContext(DialogContext);
};

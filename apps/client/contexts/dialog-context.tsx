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
import { WorkflowLogsTableData } from '@/types/workflow';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirectOnClose?: string;
  onSuccess?: () => void;
  workflowId?: string;
  asset?: BalanceItem;
  workflowLog?: WorkflowLogsTableData;
}

export type Dialogs = {
  buyZug: boolean;
  addBalance: boolean;
  withdrawBalance: boolean;
  transferAsset: boolean;
  delete: boolean;
  trigger: boolean;
  viewLog: boolean;
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
    workflowLog?: WorkflowLogsTableData
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
  openBuyZug: () => {},
  openAddBalance: () => {},
  openWithdrawBalance: () => {},
  openDelete: () => {},
  openTrigger: () => {},
  openTransferAsset: () => {},
  openViewLog: () => {},
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
  const [redirect, setRedirect] = useState<string | undefined>(undefined);
  const [onSuccess, setOnSuccess] = useState<() => void | undefined>();
  const [triggerDialog, setTriggerDialog] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | undefined>(undefined);
  const [asset, setAsset] = useState<BalanceItem | undefined>(undefined);
  const [workflowLog, setWorkflowLog] = useState<
    WorkflowLogsTableData | undefined
  >(undefined);
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
    workflowId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setWorkflowId(workflowId);
    }
    handleDialogClose(open);
    setBuyZug(open);
  };

  const openAddBalance = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setWorkflowId(workflowId);
    }
    handleDialogClose(open);
    setAddBalance(open);
  };

  const openWithdrawBalance = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setWorkflowId(workflowId);
    }
    handleDialogClose(open);
    setWithdrawBalance(open);
  };

  const openDelete = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setWorkflowId(workflowId);
    }
    handleDialogClose(open);
    setDeleteDialog(open);
  };

  const openTrigger = (
    open: boolean,
    redirectOnClose?: string,
    onSuccess?: () => void,
    workflowId?: string
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setWorkflowId(workflowId);
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
    workflowLog?: WorkflowLogsTableData
  ) => {
    if (open) {
      setRedirect(redirectOnClose);
      setOnSuccess(onSuccess);
      setWorkflowLog(workflowLog);
    }
    handleDialogClose(open);
    setViewLog(open);
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
        openBuyZug,
        openAddBalance,
        openWithdrawBalance,
        openDelete,
        openTrigger,
        openTransferAsset,
        openViewLog,
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
        workflowId={workflowId}
      />
      <DialogWithdrawBalance
        open={withdrawBalance}
        onOpenChange={openWithdrawBalance}
        onSuccess={onSuccess}
        workflowId={workflowId}
      />
      <DialogDelete
        open={deleteDialog}
        onOpenChange={openDelete}
        onSuccess={onSuccess}
        workflowId={workflowId}
      />
      <DialogTrigger
        open={triggerDialog}
        onOpenChange={openTrigger}
        onSuccess={onSuccess}
        workflowId={workflowId}
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
        workflowLog={workflowLog}
      />
    </DialogContext.Provider>
  );
};

export const useDialogContext = () => {
  return useContext(DialogContext);
};

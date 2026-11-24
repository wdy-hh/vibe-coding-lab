import { useState } from 'react';
import type { TemplateAsset } from './types';
import { useStudio } from './hooks/useStudio';
import { Layout } from './components/Layout';
import { Toasts } from './components/Common';
import { BatchDialog, ConfirmDialog, HelpDialog, TemplateDialog } from './components/Dialogs';
import { StudioPage } from './pages/StudioPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { HistoryPage } from './pages/HistoryPage';

type Dialog = { type: 'template'; template?: TemplateAsset } | { type: 'batch' } | { type: 'help' } | { type: 'confirm'; title: string; description: string; actionLabel: string; danger?: boolean; onConfirm: () => void } | null;

export default function App() {
  const studio = useStudio();
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);
  const confirm = (options: Omit<Extract<Dialog, { type: 'confirm' }>, 'type'>) => setDialog({ type: 'confirm', ...options });
  const protectWorkspace = (action: () => void, title: string, description: string) => {
    if (studio.state.workspace.items.length) confirm({ title, description, actionLabel: '继续打开', onConfirm: action });
    else action();
  };
  return <>
    <Layout studio={studio} onHelp={() => setDialog({ type: 'help' })} onReset={() => confirm({ title: '恢复默认演示数据？', description: '当前商品、自定义模板和历史批次将被重置，并重新加载 3 款示例商品。', actionLabel: '恢复默认数据', danger: true, onConfirm: studio.reset })}>
      {studio.view === 'studio' && <StudioPage key={studio.workspaceRevision} studio={studio} onSaveBatch={() => setDialog({ type: 'batch' })} onSaveTemplate={() => setDialog({ type: 'template' })} onLoadDemo={() => protectWorkspace(studio.loadDemo, '加载示例批次？', '当前工作台会替换为 3 款示例商品。已存入历史的批次与模板将继续保留。')} />}
      {studio.view === 'templates' && <TemplatesPage studio={studio} onEdit={template => setDialog({ type: 'template', template })} onDelete={template => confirm({ title: '删除这个模板？', description: `「${template.name}」将从资产库移除，已生成的商品素材会保留。`, actionLabel: '删除模板', danger: true, onConfirm: () => studio.deleteTemplate(template.id) })} />}
      {studio.view === 'history' && <HistoryPage studio={studio} onOpen={batch => protectWorkspace(() => studio.openBatch(batch.id), '重新打开历史批次？', '这会替换当前工作台的内容。当前批次如需保留，请先返回生成台保存到历史。')} onDelete={batch => confirm({ title: '删除历史批次？', description: `「${batch.batchName}」的历史记录将被删除。当前正在编辑的内容会继续保留。`, actionLabel: '删除批次', danger: true, onConfirm: () => studio.deleteBatch(batch.id) })} />}
    </Layout>
    <Toasts toasts={studio.toasts} dismiss={id => studio.setToasts(previous => previous.filter(toast => toast.id !== id))} />
    {dialog?.type === 'template' && <TemplateDialog studio={studio} template={dialog.template} onClose={close} />}
    {dialog?.type === 'batch' && <BatchDialog studio={studio} onClose={close} />}
    {dialog?.type === 'help' && <HelpDialog onClose={close} />}
    {dialog?.type === 'confirm' && <ConfirmDialog {...dialog} onClose={close} />}
  </>;
}

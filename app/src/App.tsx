import { useEffect } from 'react';
import { useAppState } from '@/hooks/useAppState';
import { useAuth } from '@/auth/useAuth';
import { AuthGate } from '@/auth/AuthGate';
import { exportCsv, exportPdf, wakeBackend } from '@/api/client';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { FooterCTA } from '@/components/landing/FooterCTA';
import { Sidebar } from '@/components/app/Sidebar';
import { Create } from '@/components/app/Create';
import { Drafts } from '@/components/app/Drafts';
import { Accounts } from '@/components/app/Accounts';
import { Approvals } from '@/components/app/Approvals';
import { Calendar } from '@/components/app/Calendar';
import { Analytics } from '@/components/app/Analytics';
import { Toast } from '@/components/app/Toast';
import { SaneGuide } from '@/components/guide/SaneGuide';

export default function App() {
  const { isAuthed, authenticate } = useAuth();
  const app = useAppState();
  const { state } = app;

  // Cold-start cover: wake the (possibly sleeping) backend on first mount,
  // regardless of auth state, so it's warm by the first real API call.
  useEffect(() => { wakeBackend(); }, []);

  if (!isAuthed) {
    return <AuthGate onAuth={authenticate} />;
  }

  // The guide is rendered as a STABLE trailing sibling of the view content
  // below, so toggling landing ↔ app never unmounts it (which would reset its
  // step and make it repeat itself).
  const guide = (
    <SaneGuide
      onGoLanding={() => app.setView('landing')}
      onSetTab={(t) => { app.setView('app'); app.setTab(t); }}
    />
  );

  const exportWith = async (fn: () => Promise<void>, label: string) => {
    try { await fn(); app.flash(`${label} downloaded.`); }
    catch (e) { app.flash('Error: ' + (e instanceof Error ? e.message : String(e)).slice(0, 80)); }
  };

  const landingView = (
    <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
      <Navbar onGoApp={() => app.setView('app')} />
      <Hero heroQuery={state.heroQuery} onHeroInput={app.setHeroQuery} onGoApp={app.goAppFromHero} />
      <HowItWorks />
      <Features />
      <FooterCTA onGoApp={() => app.setView('app')} />
    </div>
  );

  const appView = (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EDEEF5' }}>
      <Sidebar tab={state.tab} onSetTab={app.setTab} onGoSite={() => app.setView('landing')} />
      <main className="cd-scroll cd-main" style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 34px 96px' }}>

          {state.tab === 'create' && (
            <Create
              accounts={state.accounts}
              content={state.content}
              prefill={state.createPrefill}
              editDraft={state.editDraft}
              loading={state.loading}
              error={state.error}
              onRetry={app.retry}
              onSaved={app.onContentSaved}
              onClearEdit={app.clearEditDraft}
              flash={app.flash}
              onGoAccounts={() => app.setTab('accounts')}
              onGoCalendar={() => app.setTab('calendar')}
              onGoAnalytics={() => app.setTab('analytics')}
            />
          )}

          {state.tab === 'drafts' && (
            <Drafts
              content={state.content}
              accounts={state.accounts}
              loading={state.loading}
              error={state.error}
              onRetry={app.retry}
              onEdit={app.editContent}
              onDelete={app.deleteContent}
              onDuplicate={app.duplicateContent}
              onApprove={app.approve}
              onSchedule={app.scheduleContent}
              onPublishNow={app.publishContentNow}
              onGoCreate={() => app.setTab('create')}
            />
          )}

          {state.tab === 'accounts' && (
            <Accounts
              accounts={state.accounts}
              loading={state.loading}
              error={state.error}
              onConnect={app.connectAccount}
              onDisconnect={app.disconnectAccount}
              onRemove={app.removeAccount}
              onRetry={app.retry}
            />
          )}

          {state.tab === 'review' && (
            <Approvals
              content={state.content}
              selectedContentId={state.selectedContentId}
              previewPlatform={state.previewPlatform}
              accounts={state.accounts}
              loading={state.loading}
              error={state.error}
              onSelect={app.setSelectedContentId}
              onApprove={app.approve}
              onReject={app.reject}
              onSetPreviewPlatform={app.setPreviewPlatform}
              onOpenComposer={() => app.setTab('create')}
              onRetry={app.retry}
            />
          )}

          {state.tab === 'calendar' && (
            <Calendar
              weekOffset={state.weekOffset}
              scheduled={state.scheduled}
              content={state.content}
              accounts={state.accounts}
              openChip={state.openChip}
              dragRef={app.dragRef}
              loading={state.loading}
              error={state.error}
              onPrevWeek={() => app.setWeekOffset(state.weekOffset - 1)}
              onNextWeek={() => app.setWeekOffset(state.weekOffset + 1)}
              onDropOnCell={app.dropOnCell}
              onPublishNow={app.publishNow}
              onCancelSched={app.cancelSched}
              onSetOpenChip={app.setOpenChip}
              onCloseChip={app.closeChip}
              onRetry={app.retry}
              onGoCreate={() => app.setTab('create')}
            />
          )}

          {state.tab === 'analytics' && (
            <Analytics
              metrics={state.metrics}
              metricKey={state.metricKey}
              loading={state.loading}
              error={state.error}
              onSetMetricKey={app.setMetricKey}
              onExportCsv={() => exportWith(exportCsv, 'CSV')}
              onExportPdf={() => exportWith(exportPdf, 'PDF')}
              onRetry={app.retry}
            />
          )}

        </div>
      </main>
    </div>
  );

  return (
    <>
      {state.view === 'landing' ? landingView : appView}
      {state.toast && <Toast message={state.toast} />}
      {guide}
    </>
  );
}

import { useAppState } from '@/hooks/useAppState';
import { useAuth } from '@/auth/useAuth';
import { AuthGate } from '@/auth/AuthGate';
import { exportCsv, exportPdf } from '@/api/client';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Features } from '@/components/landing/Features';
import { FooterCTA } from '@/components/landing/FooterCTA';
import { Sidebar } from '@/components/app/Sidebar';
import { Accounts } from '@/components/app/Accounts';
import { Approvals } from '@/components/app/Approvals';
import { Calendar } from '@/components/app/Calendar';
import { Analytics } from '@/components/app/Analytics';
import { Composer } from '@/components/app/Composer';
import { Toast } from '@/components/app/Toast';

export default function App() {
  const { isAuthed, authenticate } = useAuth();
  const app = useAppState();
  const { state } = app;

  if (!isAuthed) {
    return <AuthGate onAuth={authenticate} />;
  }

  if (state.view === 'landing') {
    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
        <Navbar onGoApp={() => app.setView('app')} />
        <Hero heroQuery={state.heroQuery} onHeroInput={app.setHeroQuery} onGoApp={app.goAppFromHero} />
        <HowItWorks />
        <Features />
        <FooterCTA onGoApp={() => app.setView('app')} />
        {state.toast && <Toast message={state.toast} />}
      </div>
    );
  }

  const exportWith = async (fn: () => Promise<void>, label: string) => {
    try { await fn(); app.flash(`${label} downloaded.`); }
    catch (e) { app.flash('Error: ' + (e instanceof Error ? e.message : String(e)).slice(0, 80)); }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EDEEF5' }}>
      <Sidebar tab={state.tab} onSetTab={app.setTab} onGoSite={() => app.setView('landing')} />
      <main className="cd-scroll" style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 34px 80px' }}>
          {state.tab === 'accounts' && (
            <Accounts
              accounts={state.accounts}
              connectingId={state.connectingId}
              loading={state.loading}
              error={state.error}
              onConnect={app.connectAccount}
              onDisconnect={app.disconnectAccount}
              onRetry={app.retry}
            />
          )}
          {state.tab === 'approvals' && (
            <>
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
                onOpenComposer={() => app.openComposer()}
                onRetry={app.retry}
              />
              {state.composerOpen && (
                <Composer
                  accounts={state.accounts}
                  prefill={state.composerPrefill}
                  onClose={app.closeComposer}
                  onSaved={app.onComposerSaved}
                  flash={app.flash}
                />
              )}
            </>
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
      {state.toast && <Toast message={state.toast} />}
    </div>
  );
}

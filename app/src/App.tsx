import { useAppState } from '@/hooks/useAppState';
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
  const {
    state,
    dragRef,
    setView,
    setTab,
    setHeroQuery,
    setPreviewPlatform,
    setSelectedContentId,
    setMetricKey,
    setWeekOffset,
    setOpenChip,
    openComposer,
    closeComposer,
    setComposerField,
    flash,
    approve,
    reject,
    toggleAccount,
    publishNow,
    cancelSched,
    dropOnCell,
    saveComposer,
    closeChip,
  } = useAppState();

  if (state.view === 'landing') {
    return (
      <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
        <Navbar onGoApp={() => setView('app')} />
        <Hero heroQuery={state.heroQuery} onHeroInput={setHeroQuery} onGoApp={() => setView('app')} />
        <HowItWorks />
        <Features />
        <FooterCTA onGoApp={() => setView('app')} />
        {state.toast && <Toast message={state.toast} />}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#EDEEF5' }}>
      <Sidebar tab={state.tab} onSetTab={setTab} onGoSite={() => setView('landing')} />
      <main className="cd-scroll" style={{ flex: 1, minWidth: 0, height: '100vh', overflowY: 'auto' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 34px 80px' }}>
          {state.tab === 'accounts' && (
            <Accounts accounts={state.accounts} onToggle={toggleAccount} />
          )}
          {state.tab === 'approvals' && (
            <>
              <Approvals
                content={state.content}
                selectedContentId={state.selectedContentId}
                previewPlatform={state.previewPlatform}
                accounts={state.accounts}
                onSelect={setSelectedContentId}
                onApprove={approve}
                onReject={reject}
                onSetPreviewPlatform={setPreviewPlatform}
                onOpenComposer={openComposer}
              />
              {state.composerOpen && (
                <Composer
                  composer={state.composer}
                  onClose={closeComposer}
                  onSetField={setComposerField}
                  onSave={saveComposer}
                />
              )}
            </>
          )}
          {state.tab === 'calendar' && (
            <Calendar
              weekOffset={state.weekOffset}
              scheduled={state.scheduled}
              content={state.content}
              openChip={state.openChip}
              dragRef={dragRef}
              onPrevWeek={() => setWeekOffset(state.weekOffset - 1)}
              onNextWeek={() => setWeekOffset(state.weekOffset + 1)}
              onDropOnCell={dropOnCell}
              onPublishNow={publishNow}
              onCancelSched={cancelSched}
              onSetOpenChip={setOpenChip}
              onCloseChip={closeChip}
            />
          )}
          {state.tab === 'analytics' && (
            <Analytics
              metrics={state.metrics}
              metricKey={state.metricKey}
              onSetMetricKey={setMetricKey}
              onExportCsv={() => flash('CSV exported \u2014 mirrors the on-screen numbers exactly.')}
              onExportPdf={() => flash('PDF exported \u2014 mirrors the on-screen numbers exactly.')}
            />
          )}
        </div>
      </main>
      {state.toast && <Toast message={state.toast} />}
    </div>
  );
}
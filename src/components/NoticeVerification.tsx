
import { useMemo, useState } from 'react';
import { analyzeNotice, compareNotices } from '../services/noticeAnalysis';

export function NoticeVerification() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [compared, setCompared] = useState(false);

  const left = useMemo(() => analyzeNotice(leftText), [leftText]);
  const right = useMemo(() => analyzeNotice(rightText), [rightText]);

  const differences = useMemo(
    () => compared && leftText.trim() && rightText.trim()
      ? compareNotices(leftText, rightText)
      : [],
    [compared, leftText, rightText],
  );

  const ready = Boolean(leftText.trim() && rightText.trim());

  function runComparison() {
    if (!ready) return;
    setCompared(true);
  }

  function clearWorkspace() {
    setLeftText('');
    setRightText('');
    setCompared(false);
  }

  return (
    <div className="verification-workspace">
      <section className="verification-heading">
        <div>
          <p className="eyebrow">VERITAS AI / NOTICE INTELLIGENCE</p>
          <h2>Emergency Notice Verification</h2>
          <p className="muted">
            Compare emergency notices and identify differences in critical details.
          </p>
        </div>
        <span className="verification-status">HUMAN REVIEW REQUIRED</span>
      </section>

      <div className="notice-grid">
        <section className="panel notice-editor">
          <div className="notice-editor-heading">
            <div>
              <p className="eyebrow">SOURCE A</p>
              <h3>Reference notice</h3>
            </div>
            <span className="script-label">{left.script.toUpperCase()}</span>
          </div>
          <textarea
            value={leftText}
            onChange={(event) => {
              setLeftText(event.target.value);
              setCompared(false);
            }}
            placeholder="Paste the first emergency notice here…"
            rows={11}
            aria-label="Reference emergency notice"
          />
          <div className="notice-meta">
            <span>{left.wordCount} words</span>
            <span>{left.facts.length} detected facts</span>
          </div>
        </section>

        <section className="panel notice-editor">
          <div className="notice-editor-heading">
            <div>
              <p className="eyebrow">SOURCE B</p>
              <h3>Notice to compare</h3>
            </div>
            <span className="script-label">{right.script.toUpperCase()}</span>
          </div>
          <textarea
            value={rightText}
            onChange={(event) => {
              setRightText(event.target.value);
              setCompared(false);
            }}
            placeholder="Paste the second emergency notice here…"
            rows={11}
            aria-label="Second emergency notice"
          />
          <div className="notice-meta">
            <span>{right.wordCount} words</span>
            <span>{right.facts.length} detected facts</span>
          </div>
        </section>
      </div>

      <div className="verification-actions">
        <button className="primary" onClick={runComparison} disabled={!ready}>
          Compare notices
        </button>
        <button className="secondary" onClick={clearWorkspace}>
          Clear workspace
        </button>
      </div>

      {compared && (
        <section className="panel comparison-report" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ANALYSIS REPORT</p>
              <h3>Comparison results</h3>
            </div>
            <span className="verification-status">
              {differences.length} DIFFERENCE{differences.length === 1 ? '' : 'S'}
            </span>
          </div>

          <p className="muted report-disclaimer">
            Differences are automatically detected text signals, not proof of misinformation.
            Confirm against the original issuing authority before taking action.
          </p>

          {differences.length === 0 ? (
            <p className="no-differences">
              No differences were found among the supported extracted fact types.
              This does not establish that the notices are identical or authentic.
            </p>
          ) : (
            <div className="difference-list">
              {differences.map((item, index) => (
                <article className="difference-item" key={`${item.kind}-${index}`}>
                  <div className="difference-title">
                    <span className="difference-kind">{item.kind.toUpperCase()}</span>
                    <strong>{item.message}</strong>
                  </div>
                  <div className="evidence-grid">
                    <div>
                      <span className="evidence-label">SOURCE A</span>
                      <p>{item.left}</p>
                      <blockquote>{item.leftEvidence}</blockquote>
                    </div>
                    <div>
                      <span className="evidence-label">SOURCE B</span>
                      <p>{item.right}</p>
                      <blockquote>{item.rightEvidence}</blockquote>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

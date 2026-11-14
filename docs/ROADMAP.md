# BANGUJ Bridge roadmap

Goal: a small but **genuinely working** end-to-end demonstration of a bilingual (Bengali, Gujarati, English)
public-safety notice workspace, before anything else is added.

## Rules that apply to every phase

- **No fake output.** No simulated translations, extractions or verification results. If a provider is not
  configured or fails, the interface says so plainly.
- Test fixtures live only in `tests/`, and are labelled as synthetic.
- Every result carries its source, which engine produced it, and an uncertainty warning. Nothing here is an
  official warning or instruction.
- Each phase is its own branch and pull request. Existing tests are never deleted. New features ship with tests.
- Secrets live only in the Cloudflare Worker, never in the frontend.

## Phases

| Phase | What | Status |
|---|---|---|
| 0 | Map tiles send a Referer (fixes OpenStreetMap "Access blocked" in some previews); graceful fallback if the basemap is unavailable; Cloudflare `_headers` | Done (this branch) |
| 1 | Bengali, Gujarati and English interface; language switcher; locale-aware dates and numbers; deterministic script-based language detection | Next |
| 2 | Emergency notice workspace: paste or submit a notice, optional source name, link and time, detected language, original text panel, honest "service not connected" states | Planned |
| 3 | Cloudflare Worker foundation: health endpoint (reports which providers are really configured), CORS allowlist, input limits, rate limiting | Planned |
| 4 | Translation between Bengali, Gujarati and English through a real provider, side by side with the original | Planned |
| 5 | Extraction of location, event, time, severity and safety instructions, with verbatim evidence checked against the source text | Planned |
| 6 | Comparison of two notices for conflicting or missing critical information | Planned |
| 7 | D1 alert history, retention rules, evaluation on real notices | Planned |

## Minimum honest demonstration (target)

1. Paste a notice in Bengali, Gujarati or English.
2. The app detects the script (a real, deterministic check) and shows the original text.
3. If a translation provider is configured, show its translation next to the original, labelled as machine
   translation. If not, say "Translation service not connected".
4. Phases 5 and 6 are added only once 1 to 4 genuinely work.

## Known limits

- OpenStreetMap's free tile server is not meant for heavy production use. A production launch needs a tile
  provider plan.
- Machine translation of emergency notices can be wrong, especially for negation, numbers and times. Results are
  for human review.

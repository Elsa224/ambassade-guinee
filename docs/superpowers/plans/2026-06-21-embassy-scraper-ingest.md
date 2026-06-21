# Embassy Scraper Ingest — Implementation Plan (Plan 3 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the existing Python RSS scraper from "write a JSON file" into a clean ingest pipeline that normalizes its data and pushes it to the Plan 1 Laravel API (`POST /api/v1/ingest/nouvelles`), with a cron schedule.

**Architecture:** Keep the collection step (`feedparser` over 6 Guinean RSS feeds) but factor the messy inline logic into pure, testable functions: `normalize_category`, `parse_date`, `build_record`. Add a `push_records` client that posts to the API with a bearer token. The `app()` entry point collects → normalizes → pushes (and still writes the JSON file as a debug artifact). Dedup is handled server-side (upsert by `source_link`); the client just sends everything.

**Tech Stack:** Python 3.12, `feedparser`, `beautifulsoup4` (existing), `httpx` (new, for the POST), `pytest` (new, dev), `uv` for env/deps.

## Global Constraints

- **API contract = Plan 1:** `POST /api/v1/ingest/nouvelles`, header `X-Scraper-Token: <token>`, body `{ "items": [ {title,date,category,resumer,source_link,image_url} ] }`. The API upserts by `source_link` and lands items as `submitted`; it also re-hosts `image_url` to S3 — so the scraper sends the **original** source image URL, not a re-hosted one.
- **Secrets via env, never committed:** `API_BASE_URL`, `SCRAPER_INGEST_TOKEN` read from environment.
- **Canonical categories** (lowercase, underscored): map the messy feed categories to a fixed set; unknown → `actualite`. Example: `À la une`/`A la une`/`A LA UNE` → `a_la_une`.
- **Dates** parsed from RFC-822 (feed `published`) to ISO 8601 (`YYYY-MM-DDTHH:MM:SS+00:00`); unparseable → `None`.
- **Idempotent:** re-running must not duplicate (guaranteed server-side by the `source_link` unique upsert).
- **No emojis in committed files.**

---

## File Structure

Repo `scrapping-guinea-embassy-website/`:

- `src/main.py` — refactor: keep `app()` orchestration, extract pure helpers, add push step (modify).
- `src/normalize.py` — `normalize_category`, `parse_date`, `build_record` (create).
- `src/push.py` — `push_records(records, base_url, token)` (create).
- `tests/test_normalize.py`, `tests/test_push.py` — pytest (create).
- `pyproject.toml` — add `httpx`, dev `pytest`, a `[project.scripts]` stays (modify).
- `.env.example`, `README.md` — env + cron docs (create/modify).

---

## Task 1: Add tooling (httpx + pytest)

**Files:**
- Modify: `pyproject.toml`

**Interfaces:**
- Produces: `httpx` available at runtime; `pytest` available for dev; `pytest` runs (no tests yet → exit 5 is fine).

- [ ] **Step 1: Add deps**

```bash
cd /Users/elysabeth_chan/Django/scrapping-guinea-embassy-website
uv add httpx
uv add --dev pytest
```

- [ ] **Step 2: Verify**

Run: `uv run pytest -q`
Expected: "no tests ran" (exit code 5) — tooling works.

- [ ] **Step 3: Commit**

```bash
git add pyproject.toml uv.lock
git commit -m "chore: add httpx (runtime) and pytest (dev)"
```

---

## Task 2: `normalize_category`

**Files:**
- Create: `src/normalize.py`, `tests/test_normalize.py`

**Interfaces:**
- Produces: `normalize_category(raw: str | None) -> str` → one of the canonical set; unknown/empty → `'actualite'`.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_normalize.py
from src.normalize import normalize_category

def test_a_la_une_variants_collapse():
    for raw in ["À la une", "A la une", "A LA UNE", "  à La Une "]:
        assert normalize_category(raw) == "a_la_une"

def test_known_categories():
    assert normalize_category("Économie") == "economie"
    assert normalize_category("Politique") == "politique"
    assert normalize_category("Société") == "societe"

def test_unknown_and_empty_default_to_actualite():
    assert normalize_category("Publireportages") == "actualite"
    assert normalize_category(None) == "actualite"
    assert normalize_category("") == "actualite"
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_normalize.py -q`
Expected: FAIL (module missing).

- [ ] **Step 3: Implement**

```python
# src/normalize.py
import unicodedata

_CANON = {
    "a la une": "a_la_une",
    "economie": "economie",
    "politique": "politique",
    "societe": "societe",
    "sport": "sport",
    "afrique": "afrique",
    "guinee": "guinee",
    "diaspora guineenne": "diaspora",
}

def _fold(s: str) -> str:
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if not unicodedata.combining(c))
    return " ".join(s.lower().split())

def normalize_category(raw: str | None) -> str:
    if not raw:
        return "actualite"
    return _CANON.get(_fold(raw), "actualite")
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_normalize.py -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/normalize.py tests/test_normalize.py
git commit -m "feat: canonical category normalization"
```

---

## Task 3: `parse_date`

**Files:**
- Modify: `src/normalize.py`
- Modify: `tests/test_normalize.py`

**Interfaces:**
- Produces: `parse_date(raw: str | None) -> str | None` → ISO 8601 string, or `None` if unparseable.

- [ ] **Step 1: Write the failing test**

```python
# add to tests/test_normalize.py
from src.normalize import parse_date

def test_parses_rfc822():
    assert parse_date("Thu, 18 Jun 2026 11:29:18 +0000") == "2026-06-18T11:29:18+00:00"

def test_unparseable_returns_none():
    assert parse_date("Date inconnue") is None
    assert parse_date(None) is None
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_normalize.py -q`
Expected: FAIL (`parse_date` missing).

- [ ] **Step 3: Implement**

```python
# add to src/normalize.py
from email.utils import parsedate_to_datetime

def parse_date(raw: str | None) -> str | None:
    if not raw:
        return None
    try:
        return parsedate_to_datetime(raw).isoformat()
    except (TypeError, ValueError):
        return None
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_normalize.py -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/normalize.py tests/test_normalize.py
git commit -m "feat: RFC-822 to ISO 8601 date parsing"
```

---

## Task 4: `build_record`

**Files:**
- Modify: `src/normalize.py`, `tests/test_normalize.py`

**Interfaces:**
- Consumes: `normalize_category`, `parse_date`.
- Produces: `build_record(entry: dict, image_url: str, resume: str) -> dict` shaped for the API: `{title, date, category, resumer, source_link, image_url}` with category normalized and date ISO (or original-string fallback preserved under `date` only if ISO is None → send `None`).

- [ ] **Step 1: Write the failing test**

```python
# add to tests/test_normalize.py
from src.normalize import build_record

def test_build_record_normalizes():
    entry = {"title": "T", "published": "Thu, 18 Jun 2026 11:29:18 +0000",
             "tags": [{"term": "A LA UNE"}], "link": "https://x/y"}
    rec = build_record(entry, image_url="https://img/a.jpg", resume="résumé")
    assert rec == {
        "title": "T",
        "date": "2026-06-18T11:29:18+00:00",
        "category": "a_la_une",
        "resumer": "résumé",
        "source_link": "https://x/y",
        "image_url": "https://img/a.jpg",
    }

def test_build_record_missing_fields():
    rec = build_record({}, image_url="", resume="")
    assert rec["title"] == "Sans titre"
    assert rec["category"] == "actualite"
    assert rec["date"] is None
    assert rec["source_link"] == ""
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_normalize.py -q`
Expected: FAIL.

- [ ] **Step 3: Implement**

```python
# add to src/normalize.py
def build_record(entry: dict, image_url: str, resume: str) -> dict:
    tags = entry.get("tags") or []
    raw_category = tags[0]["term"] if tags and "term" in tags[0] else None
    return {
        "title": entry.get("title", "Sans titre"),
        "date": parse_date(entry.get("published")),
        "category": normalize_category(raw_category),
        "resumer": resume,
        "source_link": entry.get("link", ""),
        "image_url": image_url,
    }
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_normalize.py -q`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/normalize.py tests/test_normalize.py
git commit -m "feat: build_record assembles normalized API payload"
```

---

## Task 5: `push_records` API client

**Files:**
- Create: `src/push.py`, `tests/test_push.py`

**Interfaces:**
- Produces: `push_records(records: list[dict], base_url: str, token: str) -> int` → POSTs `{items: records}` to `{base_url}/api/v1/ingest/nouvelles` with header `X-Scraper-Token`; returns the count the API reports ingested. Raises on non-2xx.

- [ ] **Step 1: Write the failing test**

```python
# tests/test_push.py
import httpx
from src.push import push_records

def test_push_sends_items_with_token():
    captured = {}
    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        captured["token"] = request.headers.get("X-Scraper-Token")
        captured["body"] = request.read().decode()
        return httpx.Response(200, json={"ingested": 1})

    transport = httpx.MockTransport(handler)
    count = push_records(
        [{"title": "T", "source_link": "https://x/y"}],
        base_url="https://api.example",
        token="secret",
        transport=transport,
    )
    assert count == 1
    assert captured["url"] == "https://api.example/api/v1/ingest/nouvelles"
    assert captured["token"] == "secret"
    assert '"items"' in captured["body"]

def test_push_raises_on_error():
    transport = httpx.MockTransport(lambda r: httpx.Response(401, json={"message": "Unauthorized"}))
    import pytest
    with pytest.raises(httpx.HTTPStatusError):
        push_records([], "https://api.example", "bad", transport=transport)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `uv run pytest tests/test_push.py -q`
Expected: FAIL.

- [ ] **Step 3: Implement**

```python
# src/push.py
import httpx

def push_records(records: list[dict], base_url: str, token: str,
                 transport: httpx.BaseTransport | None = None) -> int:
    url = f"{base_url.rstrip('/')}/api/v1/ingest/nouvelles"
    with httpx.Client(transport=transport, timeout=30) as client:
        resp = client.post(url, headers={"X-Scraper-Token": token}, json={"items": records})
        resp.raise_for_status()
        return resp.json().get("ingested", len(records))
```

- [ ] **Step 4: Run test to verify it passes**

Run: `uv run pytest tests/test_push.py -q`
Expected: PASS (both).

- [ ] **Step 5: Commit**

```bash
git add src/push.py tests/test_push.py
git commit -m "feat: push_records posts normalized items to the ingest API"
```

---

## Task 6: Refactor `app()` to collect → normalize → push

**Files:**
- Modify: `src/main.py`

**Interfaces:**
- Consumes: `build_record` (Task 4), `push_records` (Task 5).
- Produces: `collecter_actualites()` returns records via `build_record`; `app()` collects, writes the JSON artifact (debug), and pushes when `API_BASE_URL` + `SCRAPER_INGEST_TOKEN` are set.

- [ ] **Step 1: Refactor `collecter_actualites` to use `build_record`**

Replace the inline `article = {...}` dict construction with:

```python
from src.normalize import build_record
# ... inside the entry loop, after computing image_url + resume_propre:
articles_collectes.append(build_record(entry, image_url, resume_propre))
```

- [ ] **Step 2: Add the push step to `app()`**

```python
# src/main.py (app())
import os, json
from src.push import push_records

def app():
    print("Récupération des actualités...")
    actualites = collecter_actualites()
    print(f"[Succès] {len(actualites)} articles collectés")

    with open("actus_guinee.json", "w", encoding="utf-8") as f:   # debug artifact
        json.dump(actualites, f, indent=4, ensure_ascii=False)

    base = os.environ.get("API_BASE_URL")
    token = os.environ.get("SCRAPER_INGEST_TOKEN")
    if base and token:
        ingested = push_records(actualites, base, token)
        print(f"[Succès] {ingested} articles envoyés à l'API")
    else:
        print("[Info] API_BASE_URL / SCRAPER_INGEST_TOKEN non définis — envoi ignoré")
```

- [ ] **Step 3: Verify the whole suite + a dry run**

Run: `uv run pytest -q`
Expected: PASS (normalize + push tests).
Run (no env → no push): `uv run scrapping` or `uv run python -m src.main`
Expected: collects feeds, writes JSON, prints "envoi ignoré".

- [ ] **Step 4: Commit**

```bash
git add src/main.py
git commit -m "feat: app() collects, normalizes via build_record, and pushes to the API"
```

---

## Task 7: Env template + cron documentation

**Files:**
- Create: `.env.example`
- Modify: `README.md`

**Interfaces:**
- Produces: documented env + a cron entry for shared-prod.

- [ ] **Step 1: Write `.env.example`**

```dotenv
API_BASE_URL=https://api.embassyofguineausa.org
SCRAPER_INGEST_TOKEN=
```

- [ ] **Step 2: Document running + scheduling in `README.md`**

```markdown
## Run
    uv sync
    API_BASE_URL=https://api.embassyofguineausa.org SCRAPER_INGEST_TOKEN=*** uv run python -m src.main

## Schedule (shared-prod, every 6h)
Add to the deploy user's crontab (`crontab -e`):

    0 */6 * * * cd /opt/guinea-scraper && API_BASE_URL=https://api.embassyofguineausa.org SCRAPER_INGEST_TOKEN=*** /usr/bin/uv run python -m src.main >> /var/log/guinea-scraper.log 2>&1

The token must equal the API's SCRAPER_INGEST_TOKEN. Items arrive as `submitted` for a
supervisor to curate; images are re-hosted to S3 by the API.
```

- [ ] **Step 3: Commit**

```bash
git add .env.example README.md
git commit -m "docs: scraper env template and cron schedule"
```

---

## Self-Review

**Spec coverage (spec §6):** normalization → T2-3; payload assembly → T4; authenticated push → T5; orchestration → T6; dedup is server-side (Plan 1 Task 10, unique `source_link`) and noted; image re-hosting is server-side (Plan 1) and the scraper deliberately sends the original URL; schedule → T7.
**Placeholder scan:** all code shown; no TBD/TODO.
**Type consistency:** `build_record` output keys (`title,date,category,resumer,source_link,image_url`) exactly match the Plan 1 ingest validation and the `push_records` body. `normalize_category`/`parse_date` signatures match their use in `build_record`.

---

## Execution Handoff

This is **Plan 3 of 3**. It depends only on Plan 1's ingest endpoint; it is independent of Plan 2 and can be built in parallel with the frontend work.

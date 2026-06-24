import json
import re
import sys
from pathlib import Path
import pdfplumber
import cloudscraper
from bs4 import BeautifulSoup

def extract_text_from_pdf(path: str) -> str:
    with pdfplumber.open(path) as pdf:
        return "\n".join(page.extract_text() or ""
            for page in pdf.pages
            )


def fetch_html_from_url(url: str) -> str:
    scraper = cloudscraper.create_scraper()
    response = scraper.get(url, timeout=15)
    response.raise_for_status()
    return response.text

def parse_html_for_job(html: str) -> dict:

    soup = BeautifulSoup(html, "html.parser")

    result: dict[str, str] = {
        "company": "",
        "title": "",
        "location": "",
        "job_id": "",
    }

    for script in soup.select("script[type='application/ld+json']"):
        try:
            data = json.loads(script.string)
        except (json.JSONDecodeError, TypeError):
            continue
        items = data if isinstance(data, list) else [data]
        for item in items:
            if not isinstance(item, dict):
                continue
            if item.get("@type") == "JobPosting":
                result["title"] = result["title"] or item.get("title", "")
                result["company"] = result["company"] or (
                    item.get("hiringOrganization", {}).get("name", "")
                    if isinstance(item.get("hiringOrganization"), dict)
                    else ""
                )
                result["location"] = result["location"] or (
                    loc.get("addressLocality", "")
                    if isinstance(item.get("jobLocation"), dict)
                    and isinstance(item["jobLocation"].get("address"), dict)
                    and (loc := item["jobLocation"]["address"])
                    else ""
                )

    if not result["title"]:
        og_title = soup.select_one("meta[property='og:title']")
        if og_title:
            result["title"] = og_title.get("content", "")
    if not result["company"]:
        og_site = soup.select_one("meta[property='og:site_name']")
        if og_site:
            result["company"] = og_site.get("content", "")

    if not result["title"]:
        for sel in [".job-title", ".posting-title", "h1", "[data-testid='job-title']"]:
            el = soup.select_one(sel)
            if el and el.get_text(strip=True):
                result["title"] = el.get_text(strip=True)
                break

    if not result["company"]:
        for sel in [".company-name", ".employer", "[data-testid='company-name']"]:
            el = soup.select_one(sel)
            if el and el.get_text(strip=True):
                result["company"] = el.get_text(strip=True)
                break

    if not result["location"]:
        for sel in [".location", ".posting-location", "[data-testid='location']"]:
            el = soup.select_one(sel)
            if el and el.get_text(strip=True):
                result["location"] = el.get_text(strip=True)
                break

    for sel in [".job-id", ".requisition-id", "[data-testid='job-id']"]:
        el = soup.select_one(sel)
        if el:
            text = el.get_text(strip=True)
            m = re.search(r"(\d{5,}|REQ-?\d+|JOB-?\d+)", text, re.IGNORECASE)
            if m:
                result["job_id"] = m.group(1)
                break

    return result


def parse_text_for_job(text: str) -> dict:
    result: dict[str, str] = {
        "company": "",
        "title": "",
        "location": "",
        "job_id": "",
    }

    lines = [line.strip() for line in text.split("\n") if line.strip()]

    company_patterns = [
        r"(?:About|Join|At)\s+([A-Z][A-Za-z0-9\s&.]+)",
        r"^([A-Z][A-Za-z0-9\s&.]+)\s+(?:is hiring|has openings|seeking)",
    ]
    for pat in company_patterns:
        for line in lines[:30]:
            m = re.search(pat, line)
            if m:
                result["company"] = m.group(1).strip()
                break
        if result["company"]:
            break

    title_patterns = [
        r"(?:Job\s*Title|Position|Role)\s*[:\-–]\s*(.+)",
        r"^(Software\s+\w+|Senior\s+\w+|Lead\s+\w+|Principal\s+\w+|Staff\s+\w+)",
    ]
    for pat in title_patterns:
        for line in lines:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                candidate = m.group(1).strip()
                if len(candidate) < 100:
                    result["title"] = candidate
                    break
        if result["title"]:
            break

    location_patterns = [
        r"Location\s*[:\-–]\s*(.+)",
        r"^(Remote|Hybrid|On.?site)\b",
    ]
    for pat in location_patterns:
        for line in lines:
            m = re.search(pat, line, re.IGNORECASE)
            if m:
                result["location"] = m.group(1).strip()
                break
        if result["location"]:
            break

    for line in lines:
        m = re.search(
            r"(?:Job\s*ID|Req(?:uisition)?\s*ID|ID\s*[#:])\s*[:\-–]?\s*([A-Za-z0-9_-]+)",
            line,
            re.IGNORECASE,
        )
        if m:
            result["job_id"] = m.group(1)
            break

    if not result["job_id"]:
        for line in lines:
            m = re.search(r"\b(\d{5,})\b", line)
            if m:
                result["job_id"] = m.group(1)
                break

    return result


def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "usage: main.py parse-pdf <path> | parse-url <url>"}))
        sys.exit(1)

    command = sys.argv[1]
    arg = sys.argv[2]

    try:
        if command == "parse-pdf":
            text = extract_text_from_pdf(arg)
            result = parse_text_for_job(text)
        elif command == "parse-url":
            html = fetch_html_from_url(arg)
            result = parse_html_for_job(html)
        else:
            print(json.dumps({"error": f"unknown command: {command}"}))
            sys.exit(1)

        print(json.dumps(result))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
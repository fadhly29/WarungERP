#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Design System Generator - Aggregates search results and applies reasoning
to generate comprehensive design system recommendations.
"""

import csv
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

# Fix import path
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if _SCRIPT_DIR not in sys.path:
    sys.path.insert(0, _SCRIPT_DIR)

from core import search, DATA_DIR


# ============ CONFIGURATION ============
REASONING_FILE = "ui-reasoning.csv"

SEARCH_CONFIG = {
    "product": {"max_results": 1},
    "style": {"max_results": 3},
    "color": {"max_results": 2},
    "landing": {"max_results": 2},
    "typography": {"max_results": 2}
}


# ============ DESIGN SYSTEM GENERATOR ============
class DesignSystemGenerator:
    """Generates design system recommendations from aggregated searches."""

    def __init__(self):
        self.reasoning_data = self._load_reasoning()

    def _load_reasoning(self) -> list:
        """Load reasoning rules from CSV."""
        filepath = DATA_DIR / REASONING_FILE
        if not filepath.exists():
            return []
        with open(filepath, 'r', encoding='utf-8') as f:
            return list(csv.DictReader(f))

    def _multi_domain_search(self, query: str, style_priority: list = None) -> dict:
        """Execute searches across multiple domains."""
        results = {}
        for domain, config in SEARCH_CONFIG.items():
            if domain == "style" and style_priority:
                priority_query = " ".join(style_priority[:2]) if style_priority else query
                combined_query = f"{query} {priority_query}"
                results[domain] = search(combined_query, domain, config["max_results"])
            else:
                results[domain] = search(query, domain, config["max_results"])
        return results

    def _find_reasoning_rule(self, category: str) -> dict:
        """Find matching reasoning rule for a category."""
        category_lower = category.lower()
        for rule in self.reasoning_data:
            if rule.get("UI_Category", "").lower() == category_lower:
                return rule
        for rule in self.reasoning_data:
            ui_cat = rule.get("UI_Category", "").lower()
            if ui_cat in category_lower or category_lower in ui_cat:
                return rule
        for rule in self.reasoning_data:
            ui_cat = rule.get("UI_Category", "").lower()
            keywords = ui_cat.replace("/", " ").replace("-", " ").split()
            if any(kw in category_lower for kw in keywords):
                return rule
        return {}

    def _apply_reasoning(self, category: str, search_results: dict) -> dict:
        """Apply reasoning rules to search results."""
        rule = self._find_reasoning_rule(category)
        if not rule:
            return {
                "pattern": "Hero + Features + CTA",
                "style_priority": ["Minimalism", "Flat Design"],
                "color_mood": "Professional",
                "typography_mood": "Clean",
                "key_effects": "Subtle hover transitions",
                "anti_patterns": "",
                "decision_rules": {},
                "severity": "MEDIUM"
            }
        decision_rules = {}
        try:
            decision_rules = json.loads(rule.get("Decision_Rules", "{}"))
        except json.JSONDecodeError:
            pass
        return {
            "pattern": rule.get("Recommended_Pattern", ""),
            "style_priority": [s.strip() for s in rule.get("Style_Priority", "").split("+")],
            "color_mood": rule.get("Color_Mood", ""),
            "typography_mood": rule.get("Typography_Mood", ""),
            "key_effects": rule.get("Key_Effects", ""),
            "anti_patterns": rule.get("Anti_Patterns", ""),
            "decision_rules": decision_rules,
            "severity": rule.get("Severity", "MEDIUM")
        }

    def _select_best_match(self, results: list, priority_keywords: list) -> dict:
        """Select best matching result based on priority keywords."""
        if not results:
            return {}
        if not priority_keywords:
            return results[0]
        for priority in priority_keywords:
            priority_lower = priority.lower().strip()
            for result in results:
                style_name = result.get("Style Category", "").lower()
                if priority_lower in style_name or style_name in priority_lower:
                    return result
        scored = []
        for result in results:
            result_str = str(result).lower()
            score = 0
            for kw in priority_keywords:
                kw_lower = kw.lower().strip()
                if kw_lower in result.get("Style Category", "").lower():
                    score += 10
                elif kw_lower in result.get("Keywords", "").lower():
                    score += 3
                elif kw_lower in result_str:
                    score += 1
            scored.append((score, result))
        scored.sort(key=lambda x: x[0], reverse=True)
        return scored[0][1] if scored and scored[0][0] > 0 else results[0]

    def _extract_results(self, search_result: dict) -> list:
        """Extract results list from search result dict."""
        return search_result.get("results", [])

    def generate(self, query: str, project_name: str = None) -> dict:
        """Generate complete design system recommendation."""
        product_result = search(query, "product", 1)
        product_results = product_result.get("results", [])
        category = "General"
        if product_results:
            category = product_results[0].get("Product Type", "General")

        reasoning = self._apply_reasoning(category, {})
        style_priority = reasoning.get("style_priority", [])

        search_results = self._multi_domain_search(query, style_priority)
        search_results["product"] = product_result

        style_results = self._extract_results(search_results.get("style", {}))
        color_results = self._extract_results(search_results.get("color", {}))
        typography_results = self._extract_results(search_results.get("typography", {}))
        landing_results = self._extract_results(search_results.get("landing", {}))

        best_style = self._select_best_match(style_results, reasoning.get("style_priority", []))
        best_color = color_results[0] if color_results else {}
        best_typography = typography_results[0] if typography_results else {}
        best_landing = landing_results[0] if landing_results else {}

        style_effects = best_style.get("Effects & Animation", "")
        reasoning_effects = reasoning.get("key_effects", "")
        combined_effects = style_effects if style_effects else reasoning_effects

        return {
            "project_name": project_name or query.upper(),
            "category": category,
            "pattern": {
                "name": best_landing.get("Pattern Name", reasoning.get("pattern", "Hero + Features + CTA")),
                "sections": best_landing.get("Section Order", "Hero > Features > CTA"),
                "cta_placement": best_landing.get("Primary CTA Placement", "Above fold"),
                "color_strategy": best_landing.get("Color Strategy", ""),
                "conversion": best_landing.get("Conversion Optimization", "")
            },
            "style": {
                "name": best_style.get("Style Category", "Minimalism"),
                "type": best_style.get("Type", "General"),
                "effects": style_effects,
                "keywords": best_style.get("Keywords", ""),
                "best_for": best_style.get("Best For", ""),
                "performance": best_style.get("Performance", ""),
                "accessibility": best_style.get("Accessibility", ""),
                "light_mode": best_style.get("Light Mode ✓", ""),
                "dark_mode": best_style.get("Dark Mode ✓", ""),
            },
            "colors": {
                "primary": best_color.get("Primary", "#2563EB"),
                "on_primary": best_color.get("On Primary", ""),
                "secondary": best_color.get("Secondary", "#3B82F6"),
                "accent": best_color.get("Accent", "#F97316"),
                "background": best_color.get("Background", "#F8FAFC"),
                "foreground": best_color.get("Foreground", "#1E293B"),
                "muted": best_color.get("Muted", ""),
                "border": best_color.get("Border", ""),
                "destructive": best_color.get("Destructive", ""),
                "ring": best_color.get("Ring", ""),
                "notes": best_color.get("Notes", ""),
                "cta": best_color.get("Accent", "#F97316"),
                "text": best_color.get("Foreground", "#1E293B"),
            },
            "typography": {
                "heading": best_typography.get("Heading Font", "Inter"),
                "body": best_typography.get("Body Font", "Inter"),
                "mood": best_typography.get("Mood/Style Keywords", reasoning.get("typography_mood", "")),
                "best_for": best_typography.get("Best For", ""),
                "google_fonts_url": best_typography.get("Google Fonts URL", ""),
                "css_import": best_typography.get("CSS Import", "")
            },
            "key_effects": combined_effects,
            "anti_patterns": reasoning.get("anti_patterns", ""),
            "decision_rules": reasoning.get("decision_rules", {}),
            "severity": reasoning.get("severity", "MEDIUM")
        }


# ============ OUTPUT FORMATTERS ============
BOX_WIDTH = 90


def hex_to_ansi(hex_color: str) -> str:
    """Convert hex color to ANSI True Color swatch."""
    if not hex_color or not hex_color.startswith('#'):
        return ""
    colorterm = os.environ.get('COLORTERM', '')
    if colorterm not in ('truecolor', '24bit'):
        return ""
    hex_color = hex_color.lstrip('#')
    if len(hex_color) != 6:
        return ""
    r, g, b = int(hex_color[0:2], 16), int(hex_color[2:4], 16), int(hex_color[4:6], 16)
    return f"\033[38;2;{r};{g};{b}m██\033[0m "


def ansi_ljust(s: str, width: int) -> str:
    """Like str.ljust but accounts for ANSI escape sequences."""
    visible_len = len(re.sub(r'\033\[[0-9;]*m', '', s))
    pad = width - visible_len
    return s + (" " * max(0, pad))


def section_header(name: str, width: int) -> str:
    """Create a Unicode section separator."""
    label = f"─── {name} "
    fill = "─" * (width - len(label) - 1)
    return f"├{label}{fill}┤"


def format_ascii_box(design_system: dict) -> str:
    """Format design system as Unicode box with ANSI color swatches."""
    project = design_system.get("project_name", "PROJECT")
    pattern = design_system.get("pattern", {})
    style = design_system.get("style", {})
    colors = design_system.get("colors", {})
    typography = design_system.get("typography", {})
    effects = design_system.get("key_effects", "")
    anti_patterns = design_system.get("anti_patterns", "")

    def wrap_text(text: str, prefix: str, width: int) -> list:
        if not text:
            return []
        words = text.split()
        lines = []
        current_line = prefix
        for word in words:
            if len(current_line) + len(word) + 1 <= width - 2:
                current_line += (" " if current_line != prefix else "") + word
            else:
                if current_line != prefix:
                    lines.append(current_line)
                current_line = prefix + word
        if current_line != prefix:
            lines.append(current_line)
        return lines

    sections = pattern.get("sections", "").split(">")
    sections = [s.strip() for s in sections if s.strip()]

    lines = []
    w = BOX_WIDTH - 1

    lines.append("╔" + "═" * w + "╗")
    lines.append(ansi_ljust(f"║  TARGET: {project} - RECOMMENDED DESIGN SYSTEM", BOX_WIDTH) + "║")
    lines.append("╚" + "═" * w + "╝")
    lines.append("┌" + "─" * w + "┐")

    lines.append(section_header("PATTERN", BOX_WIDTH + 1))
    lines.append(f"│  Name: {pattern.get('name', '')}".ljust(BOX_WIDTH) + "│")
    if pattern.get('conversion'):
        lines.append(f"│     Conversion: {pattern.get('conversion', '')}".ljust(BOX_WIDTH) + "│")
    if pattern.get('cta_placement'):
        lines.append(f"│     CTA: {pattern.get('cta_placement', '')}".ljust(BOX_WIDTH) + "│")
    lines.append("│     Sections:".ljust(BOX_WIDTH) + "│")
    for i, section in enumerate(sections, 1):
        lines.append(f"│       {i}. {section}".ljust(BOX_WIDTH) + "│")

    lines.append(section_header("STYLE", BOX_WIDTH + 1))
    lines.append(f"│  Name: {style.get('name', '')}".ljust(BOX_WIDTH) + "│")
    light = style.get("light_mode", "")
    dark = style.get("dark_mode", "")
    if light or dark:
        lines.append(f"│     Mode Support: Light {light}  Dark {dark}".ljust(BOX_WIDTH) + "│")
    if style.get("keywords"):
        for line in wrap_text(f"Keywords: {style.get('keywords', '')}", "│     ", BOX_WIDTH):
            lines.append(line.ljust(BOX_WIDTH) + "│")
    if style.get("best_for"):
        for line in wrap_text(f"Best For: {style.get('best_for', '')}", "│     ", BOX_WIDTH):
            lines.append(line.ljust(BOX_WIDTH) + "│")
    if style.get("performance") or style.get("accessibility"):
        perf_a11y = f"Performance: {style.get('performance', '')} | Accessibility: {style.get('accessibility', '')}"
        lines.append(f"│     {perf_a11y}".ljust(BOX_WIDTH) + "│")

    lines.append(section_header("COLORS", BOX_WIDTH + 1))
    color_entries = [
        ("Primary",      "primary",      "--color-primary"),
        ("On Primary",   "on_primary",   "--color-on-primary"),
        ("Secondary",    "secondary",    "--color-secondary"),
        ("Accent/CTA",   "accent",       "--color-accent"),
        ("Background",   "background",   "--color-background"),
        ("Foreground",   "foreground",   "--color-foreground"),
        ("Muted",        "muted",        "--color-muted"),
        ("Border",       "border",       "--color-border"),
        ("Destructive",  "destructive",  "--color-destructive"),
        ("Ring",         "ring",         "--color-ring"),
    ]
    for label, key, css_var in color_entries:
        hex_val = colors.get(key, "")
        if not hex_val:
            continue
        swatch = hex_to_ansi(hex_val)
        content = f"│     {swatch}{label + ':':14s} {hex_val:10s} ({css_var})"
        lines.append(ansi_ljust(content, BOX_WIDTH) + "│")
    if colors.get("notes"):
        for line in wrap_text(f"Notes: {colors.get('notes', '')}", "│     ", BOX_WIDTH):
            lines.append(line.ljust(BOX_WIDTH) + "│")

    lines.append(section_header("TYPOGRAPHY", BOX_WIDTH + 1))
    lines.append(f"│  {typography.get('heading', '')} / {typography.get('body', '')}".ljust(BOX_WIDTH) + "│")
    if typography.get("mood"):
        for line in wrap_text(f"Mood: {typography.get('mood', '')}", "│     ", BOX_WIDTH):
            lines.append(line.ljust(BOX_WIDTH) + "│")
    if typography.get("best_for"):
        for line in wrap_text(f"Best For: {typography.get('best_for', '')}", "│     ", BOX_WIDTH):
            lines.append(line.ljust(BOX_WIDTH) + "│")
    if typography.get("google_fonts_url"):
        lines.append(f"│     Google Fonts: {typography.get('google_fonts_url', '')}".ljust(BOX_WIDTH) + "│")
    if typography.get("css_import"):
        lines.append(f"│     CSS Import: {typography.get('css_import', '')[:70]}...".ljust(BOX_WIDTH) + "│")

    if effects:
        lines.append(section_header("KEY EFFECTS", BOX_WIDTH + 1))
        for line in wrap_text(effects, "│     ", BOX_WIDTH):
            lines.append(line.ljust(BOX_WIDTH) + "│")

    if anti_patterns:
        lines.append(section_header("AVOID", BOX_WIDTH + 1))
        for line in wrap_text(anti_patterns, "│     ", BOX_WIDTH):
            lines.append(line.ljust(BOX_WIDTH) + "│")

    lines.append(section_header("PRE-DELIVERY CHECKLIST", BOX_WIDTH + 1))
    checklist_items = [
        "[ ] No emojis as icons (use SVG: Heroicons/Lucide)",
        "[ ] cursor-pointer on all clickable elements",
        "[ ] Hover states with smooth transitions (150-300ms)",
        "[ ] Light mode: text contrast 4.5:1 minimum",
        "[ ] Focus states visible for keyboard nav",
        "[ ] prefers-reduced-motion respected",
        "[ ] Responsive: 375px, 768px, 1024px, 1440px"
    ]
    for item in checklist_items:
        lines.append(f"│     {item}".ljust(BOX_WIDTH) + "│")

    lines.append("└" + "─" * w + "┘")
    return "\n".join(lines)


def format_markdown(design_system: dict) -> str:
    """Format design system as markdown."""
    project = design_system.get("project_name", "PROJECT")
    pattern = design_system.get("pattern", {})
    style = design_system.get("style", {})
    colors = design_system.get("colors", {})
    typography = design_system.get("typography", {})
    effects = design_system.get("key_effects", "")
    anti_patterns = design_system.get("anti_patterns", "")

    lines = []
    lines.append(f"## Design System: {project}")
    lines.append("")

    lines.append("### Pattern")
    lines.append(f"- **Name:** {pattern.get('name', '')}")
    if pattern.get('conversion'):
        lines.append(f"- **Conversion Focus:** {pattern.get('conversion', '')}")
    if pattern.get('cta_placement'):
        lines.append(f"- **CTA Placement:** {pattern.get('cta_placement', '')}")
    if pattern.get('color_strategy'):
        lines.append(f"- **Color Strategy:** {pattern.get('color_strategy', '')}")
    lines.append(f"- **Sections:** {pattern.get('sections', '')}")
    lines.append("")

    lines.append("### Style")
    lines.append(f"- **Name:** {style.get('name', '')}")
    light = style.get("light_mode", "")
    dark = style.get("dark_mode", "")
    if light or dark:
        lines.append(f"- **Mode Support:** Light {light} | Dark {dark}")
    if style.get('keywords'):
        lines.append(f"- **Keywords:** {style.get('keywords', '')}")
    if style.get('best_for'):
        lines.append(f"- **Best For:** {style.get('best_for', '')}")
    if style.get('performance') or style.get('accessibility'):
        lines.append(f"- **Performance:** {style.get('performance', '')} | **Accessibility:** {style.get('accessibility', '')}")
    lines.append("")

    lines.append("### Colors")
    lines.append("| Role | Hex | CSS Variable |")
    lines.append("|------|-----|--------------|")
    md_color_entries = [
        ("Primary",      "primary",      "--color-primary"),
        ("On Primary",   "on_primary",   "--color-on-primary"),
        ("Secondary",    "secondary",    "--color-secondary"),
        ("Accent/CTA",   "accent",       "--color-accent"),
        ("Background",   "background",   "--color-background"),
        ("Foreground",   "foreground",   "--color-foreground"),
        ("Muted",        "muted",        "--color-muted"),
        ("Border",       "border",       "--color-border"),
        ("Destructive",  "destructive",  "--color-destructive"),
        ("Ring",         "ring",         "--color-ring"),
    ]
    for label, key, css_var in md_color_entries:
        hex_val = colors.get(key, "")
        if hex_val:
            lines.append(f"| {label} | `{hex_val}` | `{css_var}` |")
    if colors.get("notes"):
        lines.append(f"\n*Notes: {colors.get('notes', '')}*")
    lines.append("")

    lines.append("### Typography")
    lines.append(f"- **Heading:** {typography.get('heading', '')}")
    lines.append(f"- **Body:** {typography.get('body', '')}")
    if typography.get("mood"):
        lines.append(f"- **Mood:** {typography.get('mood', '')}")
    if typography.get("best_for"):
        lines.append(f"- **Best For:** {typography.get('best_for', '')}")
    if typography.get("google_fonts_url"):
        lines.append(f"- **Google Fonts:** {typography.get('google_fonts_url', '')}")
    if typography.get("css_import"):
        lines.append(f"- **CSS Import:**")
        lines.append(f"```css")
        lines.append(f"{typography.get('css_import', '')}")
        lines.append(f"```")
    lines.append("")

    if effects:
        lines.append("### Key Effects")
        lines.append(f"{effects}")
        lines.append("")

    if anti_patterns:
        lines.append("### Avoid (Anti-patterns)")
        newline_bullet = '\n- '
        lines.append(f"- {anti_patterns.replace(' + ', newline_bullet)}")
        lines.append("")

    lines.append("### Pre-Delivery Checklist")
    lines.append("- [ ] No emojis as icons (use SVG: Heroicons/Lucide)")
    lines.append("- [ ] cursor-pointer on all clickable elements")
    lines.append("- [ ] Hover states with smooth transitions (150-300ms)")
    lines.append("- [ ] Light mode: text contrast 4.5:1 minimum")
    lines.append("- [ ] Focus states visible for keyboard nav")
    lines.append("- [ ] prefers-reduced-motion respected")
    lines.append("- [ ] Responsive: 375px, 768px, 1024px, 1440px")
    lines.append("")

    return "\n".join(lines)


# ============ MAIN ENTRY POINT ============
def generate_design_system(query: str, project_name: str = None, output_format: str = "ascii",
                           persist: bool = False, page: str = None, output_dir: str = None) -> str:
    generator = DesignSystemGenerator()
    design_system = generator.generate(query, project_name)

    if persist:
        persist_design_system(design_system, page, output_dir, query)

    if output_format == "markdown":
        return format_markdown(design_system)
    return format_ascii_box(design_system)


# ============ PERSISTENCE FUNCTIONS ============
def persist_design_system(design_system: dict, page: str = None, output_dir: str = None, page_query: str = None) -> dict:
    base_dir = Path(output_dir) if output_dir else Path.cwd()
    project_name = design_system.get("project_name", "default")
    project_slug = project_name.lower().replace(' ', '-')

    design_system_dir = base_dir / "design-system" / project_slug
    pages_dir = design_system_dir / "pages"

    created_files = []
    design_system_dir.mkdir(parents=True, exist_ok=True)
    pages_dir.mkdir(parents=True, exist_ok=True)

    master_file = design_system_dir / "MASTER.md"
    master_content = format_master_md(design_system)
    with open(master_file, 'w', encoding='utf-8') as f:
        f.write(master_content)
    created_files.append(str(master_file))

    if page:
        page_file = pages_dir / f"{page.lower().replace(' ', '-')}.md"
        page_content = format_page_override_md(design_system, page, page_query)
        with open(page_file, 'w', encoding='utf-8') as f:
            f.write(page_content)
        created_files.append(str(page_file))

    return {
        "status": "success",
        "design_system_dir": str(design_system_dir),
        "created_files": created_files
    }


def format_master_md(design_system: dict) -> str:
    project = design_system.get("project_name", "PROJECT")
    pattern = design_system.get("pattern", {})
    style = design_system.get("style", {})
    colors = design_system.get("colors", {})
    typography = design_system.get("typography", {})
    effects = design_system.get("key_effects", "")
    anti_patterns = design_system.get("anti_patterns", "")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    lines = [
        "# Design System Master File",
        "",
        "> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.",
        "> If that file exists, its rules **override** this Master file.",
        "> If not, strictly follow the rules below.",
        "",
        "---",
        "",
        f"**Project:** {project}",
        f"**Generated:** {timestamp}",
        f"**Category:** {design_system.get('category', 'General')}",
        "",
        "---",
        "",
        "## Global Rules",
        "",
        "### Color Palette",
        "",
        "| Role | Hex | CSS Variable |",
        "|------|-----|--------------|",
    ]
    for label, key, css_var in [
        ("Primary", "primary", "--color-primary"),
        ("On Primary", "on_primary", "--color-on-primary"),
        ("Secondary", "secondary", "--color-secondary"),
        ("Accent/CTA", "accent", "--color-accent"),
        ("Background", "background", "--color-background"),
        ("Foreground", "foreground", "--color-foreground"),
        ("Muted", "muted", "--color-muted"),
        ("Border", "border", "--color-border"),
        ("Destructive", "destructive", "--color-destructive"),
        ("Ring", "ring", "--color-ring"),
    ]:
        hex_val = colors.get(key, "")
        if hex_val:
            lines.append(f"| {label} | `{hex_val}` | `{css_var}` |")

    lines.extend([
        "",
        "### Typography",
        "",
        f"- **Heading Font:** {typography.get('heading', 'Inter')}",
        f"- **Body Font:** {typography.get('body', 'Inter')}",
        "",
        "### Spacing Variables",
        "",
        "| Token | Value | Usage |",
        "|-------|-------|-------|",
        "| `--space-xs` | `4px` / `0.25rem` | Tight gaps |",
        "| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |",
        "| `--space-md` | `16px` / `1rem` | Standard padding |",
        "| `--space-lg` | `24px` / `1.5rem` | Section padding |",
        "| `--space-xl` | `32px` / `2rem` | Large gaps |",
        "| `--space-2xl` | `48px` / `3rem` | Section margins |",
        "| `--space-3xl` | `64px` / `4rem` | Hero padding |",
        "",
        "---",
        "",
        "## Style Guidelines",
        "",
        f"**Style:** {style.get('name', 'Minimalism')}",
        f"**Pattern:** {pattern.get('name', '')}",
        f"**Sections:** {pattern.get('sections', '')}",
        "",
        "---",
        "",
        "## Pre-Delivery Checklist",
        "",
        "- [ ] No emojis used as icons (use SVG instead)",
        "- [ ] All icons from consistent icon set",
        "- [ ] Hover states with smooth transitions (150-300ms)",
        "- [ ] Light mode: text contrast 4.5:1 minimum",
        "- [ ] Focus states visible for keyboard navigation",
        "- [ ] `prefers-reduced-motion` respected",
        "- [ ] Responsive: 375px, 768px, 1024px, 1440px",
        "",
    ])

    return "\n".join(lines)


def format_page_override_md(design_system: dict, page_name: str, page_query: str = None) -> str:
    project = design_system.get("project_name", "PROJECT")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    page_title = page_name.replace("-", " ").replace("_", " ").title()

    lines = [
        f"# {page_title} Page Overrides",
        "",
        f"> **PROJECT:** {project}",
        f"> **Generated:** {timestamp}",
        "",
        "> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/MASTER.md`).",
        "> Only deviations from the Master are documented here. For all other rules, refer to the Master.",
        "",
        "---",
        "",
        "## Page-Specific Rules",
        "",
        "### Layout Overrides",
        "- No overrides — use Master layout",
        "",
        "### Spacing Overrides",
        "- No overrides — use Master spacing",
        "",
        "### Typography Overrides",
        "- No overrides — use Master typography",
        "",
        "### Color Overrides",
        "- No overrides — use Master colors",
        "",
    ]

    return "\n".join(lines)


# ============ CLI SUPPORT ============
if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Generate Design System")
    parser.add_argument("query", help="Search query (e.g., 'SaaS dashboard')")
    parser.add_argument("--project-name", "-p", type=str, default=None, help="Project name")
    parser.add_argument("--format", "-f", choices=["ascii", "markdown"], default="ascii", help="Output format")
    args = parser.parse_args()
    result = generate_design_system(args.query, args.project_name, args.format)
    print(result)

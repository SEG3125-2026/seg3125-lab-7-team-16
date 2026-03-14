# SEG3125 Lab 7 – Heritage Archive (Team 16)

**Deadline:** March 15th, 11:59 PM  
**Worth:** 3%

## Website Implementation

This project is a **Heritage Archive** — a museum/cultural archive site featuring Canadian art and history from the [team repo](https://github.com/SEG3125-2026/seg3125-lab-7-team-16).

### Features

- **Landing page** — Hero section + featured artworks
- **Browse** — List of all documents (The Battle, The Devil, The Pianist)
- **Document detail** — Image, metadata (from JSON), audio player (MP3), and **comment section**
- **Help** — FAQ and usage instructions

### How to Run

```bash
# Option 1: Python (if installed)
cd seg3125-lab7-website-design
python3 -m http.server 8000

# Option 2: Node (npx)
npx serve .
```

Then open **http://localhost:8000** (or the port shown).

You can also open `index.html` directly in a browser; images and audio load from GitHub. If `config.json` fails (e.g. file://), the app uses a built-in fallback.

### Files

| File | Purpose |
|------|---------|
| `index.html` | Main page, routing, structure |
| `styles.css` | Styling (Lab 7 heuristics) |
| `app.js` | Routing, document display, comments (localStorage) |
| `data/config.json` | Document list and asset URLs |
| `report.md` | Lab report template |
| `workflow.md` | Workflow diagram |

---

## Lab 7 Report Requirements

1. **Figma prototypes** – Create sketches for each main process
2. **Workflow** – See `workflow.md` for the feature workflow
3. **Report** – Fill in `report.md` and export to PDF

## Submission Checklist

- [ ] Website name and domain chosen
- [ ] Figma prototypes created for each process
- [ ] Figma link added to report
- [ ] Workflow diagram completed
- [ ] Report sections filled: purpose, semantic network, 4+ human processes, 10 heuristics
- [ ] Report exported and submitted (PDF)

# Mindful Toolbox

A calm little website for people who don't know what they want to find.
No login required to use any of the tools.

## What's inside

- **Write** - a blank page to write freely, with a soft phrase on top
- **Timer** - a Pomodoro focus timer
- **Snake** - a low-pressure snake game

## Why it tracks usage

The site logs small, anonymous events (which page was viewed, when a
timer finishes, etc) to a local SQLite database (`analytics.db`),
with a random per-visit session id - no accounts, no personal info.
The idea is to later analyze this data (e.g. in pandas or Power BI)
as its own project: which tool do people actually use, how long do
they stay, what time of day is it busiest. Nothing is sold or shared.

## How to run it locally

1. Make sure Python is installed.
2. Open a terminal in this folder.
3. Install Flask:

   pip install -r requirements.txt

4. Run the app:

   python app.py

5. Open your browser to: http://127.0.0.1:5000

## Project structure

- `app.py` - Flask backend: serves pages, logs events to SQLite
- `templates/` - HTML pages (base layout + home/write/timer/snake)
- `static/css/style.css` - all styling
- `static/js/` - tracking, timer, and snake game logic
- `static/manifest.json` - makes the site installable as an app (PWA)
- `analytics.db` - created automatically the first time you run the app

## Next steps (ideas for later)

- Add a service worker for full offline PWA support
- Add optional login + saving for the writing page
- Build a small dashboard (pandas/Power BI) off analytics.db
- Add a few rotating calm phrases instead of one static one per page

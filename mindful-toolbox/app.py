"""
Mindful Toolbox - main Flask app.

A calm little website with three tools:
- A blank page to write freely
- A Pomodoro timer
- A snake game

No login required. Basic anonymous usage events are logged to a local
SQLite database so you can later analyze how people use the site
(which tool is used most, how long they stay, etc).
"""

from flask import Flask, render_template, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "analytics.db")


def init_db():
    """Create the analytics table if it doesn't exist yet."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            event_type TEXT,
            page TEXT,
            timestamp TEXT
        )
        """
    )
    conn.commit()
    conn.close()


@app.route("/")
def home():
    return render_template("write.html")


@app.route("/write")
def write_page():
    return render_template("write.html")


@app.route("/timer")
def timer_page():
    return render_template("timer.html")


@app.route("/snake")
def snake_page():
    return render_template("snake.html")


@app.route("/api/track", methods=["POST"])
def track_event():
    """
    Receives a small JSON event from the frontend, e.g.:
    { "session_id": "abc123", "event_type": "page_view", "page": "write" }

    This is anonymous - no personal info, just behavior patterns,
    so Felix can analyze usage later in Power BI / pandas.
    """
    data = request.get_json(force=True)
    session_id = data.get("session_id", "unknown")
    event_type = data.get("event_type", "unknown")
    page = data.get("page", "unknown")
    timestamp = datetime.utcnow().isoformat()

    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO events (session_id, event_type, page, timestamp) VALUES (?, ?, ?, ?)",
        (session_id, event_type, page, timestamp),
    )
    conn.commit()
    conn.close()

    return jsonify({"status": "ok"})


if __name__ == "__main__":
    init_db()
    app.run(debug=True, port=5000)

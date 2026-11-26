#!/usr/bin/env python3
"""モノノカタリ -天下統一- ランク戦サーバー（Python 標準ライブラリだけ）

  使い方:  python3 server/rank_server.py [ポート番号]   (既定 8766)

- POST /api/player     自分の名前・レート・防衛編成を登録（上書き）
- GET  /api/opponents  レートが近いプレイヤーを3人まで返す
- GET  /api/ranking    レートの上位50人
データは server/rank_data.json に保存（GitHub Pages には出ないよう .gitignore 済み）
"""
import json
import random
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(HERE, 'rank_data.json')
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get('PORT', 8766))

UNIT_KEYS = {'suzune', 'kodama', 'hakua', 'maimai', 'rangyo', 'gekomaru', 'uroko', 'kuroro', 'komori', 'kohaku', 'sinonome', 'nejimaru'}
ID_RE = re.compile(r'^[a-z0-9]{6,24}$')
SEASON_RE = re.compile(r'^\d{4}-\d{2}$')
MAX_PLAYERS = 20000

lock = threading.Lock()
players = {}  # id -> {id, name, rating, wins, losses, season, team, updated}


def load():
    global players
    try:
        with open(DATA_FILE, encoding='utf-8') as f:
            players = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        players = {}


def save():
    tmp = DATA_FILE + '.tmp'
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(players, f, ensure_ascii=False)
    os.replace(tmp, DATA_FILE)


def clean_player(d):
    """送られてきたデータを確かめて、おかしければ None"""
    if not isinstance(d, dict):
        return None
    pid = d.get('id')
    name = d.get('name')
    team = d.get('team')
    season = d.get('season')
    try:
        rating = int(d.get('rating'))
        wins = int(d.get('wins', 0))
        losses = int(d.get('losses', 0))
    except (TypeError, ValueError):
        return None
    if not (isinstance(pid, str) and ID_RE.match(pid)):
        return None
    if not (isinstance(name, str) and 0 < len(name.strip()) <= 12):
        return None
    if not (isinstance(season, str) and SEASON_RE.match(season)):
        return None
    if not (isinstance(team, list) and 1 <= len(team) <= 5 and all(k in UNIT_KEYS for k in team) and len(set(team)) == len(team)):
        return None
    if not (0 <= rating <= 4000 and 0 <= wins <= 100000 and 0 <= losses <= 100000):
        return None
    return {'id': pid, 'name': name.strip(), 'rating': rating, 'wins': wins, 'losses': losses,
            'season': season, 'team': team, 'updated': int(time.time())}


def public(p):
    return {k: p[k] for k in ('id', 'name', 'rating', 'team', 'wins', 'losses')}


class Handler(BaseHTTPRequestHandler):
    server_version = 'MononoRank/1'

    def log_message(self, fmt, *args):
        pass  # 静かに

    def send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, ngrok-skip-browser-warning')
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        q = {k: v[0] for k, v in parse_qs(url.query).items()}
        season = q.get('season', '')
        if url.path == '/api/health':
            return self.send_json(200, {'ok': True, 'players': len(players)})
        if url.path == '/api/opponents':
            try:
                rating = int(q.get('rating', '1000'))
            except ValueError:
                rating = 1000
            me = q.get('id', '')
            month_ago = time.time() - 30 * 86400
            with lock:
                pool = [p for p in players.values() if p['id'] != me and p['season'] == season and p['updated'] > month_ago and abs(p['rating'] - rating) <= 300]
            pool.sort(key=lambda p: abs(p['rating'] - rating))

            near = pool[:8]
            random.shuffle(near)
            return self.send_json(200, {'players': [public(p) for p in near[:3]]})
        if url.path == '/api/ranking':
            with lock:
                pool = [p for p in players.values() if p['season'] == season]
            pool.sort(key=lambda p: -p['rating'])
            return self.send_json(200, {'players': [public(p) for p in pool[:50]]})
        self.send_json(404, {'error': 'not found'})

    def do_POST(self):
        url = urlparse(self.path)
        length = int(self.headers.get('Content-Length') or 0)
        if length > 4096:
            return self.send_json(413, {'error': 'too large'})
        try:
            data = json.loads(self.rfile.read(length) or b'{}')
        except json.JSONDecodeError:
            return self.send_json(400, {'error': 'bad json'})
        if url.path == '/api/player':
            p = clean_player(data)
            if not p:
                return self.send_json(400, {'error': 'bad player'})
            with lock:
                if p['id'] not in players and len(players) >= MAX_PLAYERS:
                    return self.send_json(503, {'error': 'full'})
                players[p['id']] = p
                save()
            return self.send_json(200, {'ok': True})
        self.send_json(404, {'error': 'not found'})


if __name__ == '__main__':
    load()
    print(f'ランク戦サーバー: http://localhost:{PORT}/api/health  （止める: Ctrl+C）', flush=True)
    ThreadingHTTPServer(('127.0.0.1', PORT), Handler).serve_forever()

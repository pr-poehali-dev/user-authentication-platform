"""
Pulse Auth API v2 — регистрация, вход, SMS-коды, сессии.
Аккаунт создателя: телефон 6767, код 6767, ник creator, пароль creator_secret_2024.
"""
import json
import os
import random
import hashlib
import secrets
import psycopg2
from datetime import datetime, timedelta

SCHEMA = "t_p16706166_user_authentication_"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Token",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ok(data: dict, status: int = 200):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False, default=str)}


def err(msg: str, status: int = 400):
    return {"statusCode": status, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()


def ensure_creator(cur):
    cur.execute(f"SELECT id FROM {SCHEMA}.pulse_users WHERE phone = '6767'")
    if not cur.fetchone():
        cur.execute(
            f"INSERT INTO {SCHEMA}.pulse_users (phone, username, name, password_hash, premium, diamonds, bio, avatar) "
            f"VALUES ('6767', 'creator', 'Создатель Pulse', %s, TRUE, 99999, 'Основатель мессенджера Pulse ⚡', '👑')",
            (hash_pw("creator_secret_2024"),)
        )


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    raw_path = event.get("path", "/")

    body = {}
    if event.get("body"):
        try:
            body = json.loads(event["body"])
        except Exception:
            pass

    # Определяем action: из body или из последнего сегмента пути
    path_part = raw_path.strip("/").split("/")[-1] if raw_path.strip("/") else ""
    action = body.get("action") or path_part or "unknown"

    conn = get_conn()
    try:
        with conn:
            with conn.cursor() as cur:
                ensure_creator(cur)

                # ── send-code ─────────────────────────────────────────────
                if action == "send-code" and method == "POST":
                    phone = (body.get("phone") or "").strip()
                    if not phone:
                        return err("Укажи номер телефона")

                    code = "6767" if phone == "6767" else str(random.randint(100000, 999999))
                    expires = datetime.utcnow() + timedelta(minutes=10)

                    cur.execute(
                        f"UPDATE {SCHEMA}.pulse_sms_codes SET used = TRUE WHERE phone = %s AND used = FALSE",
                        (phone,)
                    )
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.pulse_sms_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
                        (phone, code, expires)
                    )
                    return ok({"success": True, "demo_code": code, "message": f"Код отправлен на {phone}"})

                # ── verify-code ───────────────────────────────────────────
                elif action == "verify-code" and method == "POST":
                    phone = (body.get("phone") or "").strip()
                    code = (body.get("code") or "").strip()
                    if not phone or not code:
                        return err("Укажи телефон и код")

                    cur.execute(
                        f"SELECT id FROM {SCHEMA}.pulse_sms_codes "
                        f"WHERE phone = %s AND code = %s AND used = FALSE AND expires_at > NOW() "
                        f"ORDER BY id DESC LIMIT 1",
                        (phone, code)
                    )
                    row = cur.fetchone()
                    if not row:
                        return err("Неверный или устаревший код")

                    cur.execute(
                        f"UPDATE {SCHEMA}.pulse_sms_codes SET used = TRUE WHERE id = %s",
                        (row[0],)
                    )
                    return ok({"success": True, "verified": True})

                # ── register ──────────────────────────────────────────────
                elif action == "register" and method == "POST":
                    phone = (body.get("phone") or "").strip()
                    username = (body.get("username") or "").strip().lower()
                    name = (body.get("name") or "").strip()
                    password = (body.get("password") or "").strip()

                    if not all([phone, username, name, password]):
                        return err("Заполни все поля")
                    if len(password) < 6:
                        return err("Пароль минимум 6 символов")
                    if len(username) < 3:
                        return err("Ник минимум 3 символа")

                    cur.execute(f"SELECT id FROM {SCHEMA}.pulse_users WHERE phone = %s", (phone,))
                    if cur.fetchone():
                        return err("Этот номер уже зарегистрирован")

                    cur.execute(f"SELECT id FROM {SCHEMA}.pulse_users WHERE username = %s", (username,))
                    if cur.fetchone():
                        return err("Этот ник уже занят")

                    cur.execute(
                        f"INSERT INTO {SCHEMA}.pulse_users (phone, username, name, password_hash) "
                        f"VALUES (%s, %s, %s, %s) RETURNING id",
                        (phone, username, name, hash_pw(password))
                    )
                    user_id = cur.fetchone()[0]
                    token = secrets.token_hex(32)
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.pulse_sessions (user_id, token) VALUES (%s, %s)",
                        (user_id, token)
                    )
                    return ok({
                        "success": True, "token": token,
                        "user": {"id": user_id, "phone": phone, "username": username, "name": name, "premium": False, "diamonds": 100, "bio": "", "avatar": "😎"}
                    })

                # ── login ─────────────────────────────────────────────────
                elif action == "login" and method == "POST":
                    phone = (body.get("phone") or "").strip()
                    username = (body.get("username") or "").strip().lower()
                    password = (body.get("password") or "").strip()

                    if not password:
                        return err("Укажи пароль")
                    if not phone and not username:
                        return err("Укажи телефон или ник")

                    if username:
                        cur.execute(
                            f"SELECT id, phone, username, name, premium, diamonds, bio, avatar "
                            f"FROM {SCHEMA}.pulse_users WHERE username = %s AND password_hash = %s",
                            (username, hash_pw(password))
                        )
                    else:
                        cur.execute(
                            f"SELECT id, phone, username, name, premium, diamonds, bio, avatar "
                            f"FROM {SCHEMA}.pulse_users WHERE phone = %s AND password_hash = %s",
                            (phone, hash_pw(password))
                        )

                    row = cur.fetchone()
                    if not row:
                        return err("Неверный телефон/ник или пароль")

                    uid, u_phone, u_user, u_name, u_prem, u_dia, u_bio, u_ava = row
                    token = secrets.token_hex(32)
                    cur.execute(
                        f"INSERT INTO {SCHEMA}.pulse_sessions (user_id, token) VALUES (%s, %s)",
                        (uid, token)
                    )
                    return ok({
                        "success": True, "token": token,
                        "user": {"id": uid, "phone": u_phone, "username": u_user, "name": u_name, "premium": u_prem, "diamonds": u_dia, "bio": u_bio or "", "avatar": u_ava or "😎"}
                    })

                # ── me ────────────────────────────────────────────────────
                elif action == "me" and method == "GET":
                    token = ((event.get("headers") or {}).get("X-Session-Token")
                             or (event.get("queryStringParameters") or {}).get("token"))
                    if not token:
                        return err("Нет токена", 401)

                    cur.execute(
                        f"SELECT u.id, u.phone, u.username, u.name, u.premium, u.diamonds, u.bio, u.avatar "
                        f"FROM {SCHEMA}.pulse_sessions s JOIN {SCHEMA}.pulse_users u ON u.id = s.user_id "
                        f"WHERE s.token = %s AND s.expires_at > NOW()",
                        (token,)
                    )
                    row = cur.fetchone()
                    if not row:
                        return err("Сессия недействительна", 401)

                    return ok({"user": {"id": row[0], "phone": row[1], "username": row[2], "name": row[3], "premium": row[4], "diamonds": row[5], "bio": row[6] or "", "avatar": row[7] or "😎"}})

                else:
                    return ok({"status": "Pulse Auth API v1.0"})

    finally:
        conn.close()
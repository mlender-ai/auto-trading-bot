# Telegram Setup

## 1. Create a Bot

1. Open Telegram.
2. Search for `@BotFather`.
3. Run `/newbot`.
4. Save the bot token.

## 2. Get the Chat ID

The simplest method:

1. Start a chat with your bot.
2. Send one message to it.
3. Open this URL in a browser, replacing the token:

```text
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

4. Find `chat.id` in the response.

## 3. Configure `.env`

```bash
TELEGRAM_BOT_TOKEN="123456:token"
TELEGRAM_CHAT_ID="123456789"
TELEGRAM_NOTIFICATIONS_ENABLED=true
TELEGRAM_NOTIFY_SKIPPED=true
```

Recommended:

- keep `TELEGRAM_NOTIFICATIONS_ENABLED=true` only when you actually want alerts
- set `TELEGRAM_NOTIFY_SKIPPED=false` if skip notifications are too noisy

## 4. Test the Bot

API test:

```bash
curl -s \
  -X POST \
  -H "content-type: application/json" \
  -H "x-dashboard-password: local-demo-password" \
  -d '{"text":"telegram test"}' \
  http://127.0.0.1:4000/telegram/test
```

Script test:

```bash
npm run telegram:test -- "telegram test"
```

## 5. What Events Are Sent

Telegram receives:

- entry
- exit
- take profit
- stop loss
- skip
- error
- daily report
- weekly report

## 6. Alert Format

Entry example:

```text
[ENTRY]
BTCUSDT
시간: 2026-03-31T16:24:00.000Z
전략: A
사유: BB 하단 복귀 + RSI 반등 + 비용 필터 통과
수수료: 0.97 USD
```

Exit example:

```text
[EXIT]
BTCUSDT
시간: 2026-03-31T16:41:00.000Z
전략: A
사유: 평균회귀 목표 도달
실현손익: +18.41 USD
수수료: 0.97 USD
```

## 7. How UI and Telegram Stay in Sync

- The worker emits a structured paper event.
- The event is written to `system_logs` with source `paper-event`.
- The same event is optionally forwarded to `TelegramNotifier`.
- The UI polls `GET /paper/logs` and renders the same stored event stream.

This keeps the UI log panel and Telegram on one event source instead of two separate implementations.

## 8. Troubleshooting

### Telegram message does not arrive

- Check `TELEGRAM_BOT_TOKEN`
- Check `TELEGRAM_CHAT_ID`
- Confirm you sent at least one message to the bot first
- Run `npm run telegram:test`
- Check `/worker/status.lastTelegramStatus`

### UI shows logs but Telegram does not

- Check `/worker/status.lastTelegramError`
- Check `TELEGRAM_NOTIFICATIONS_ENABLED=true`
- Check whether the event type is filtered
- Confirm the bot has permission to message the chat

### Telegram test returns `SKIPPED`

- `TELEGRAM_NOTIFICATIONS_ENABLED=false`
- missing token
- missing chat id

### Telegram test returns `FAILED`

- invalid bot token
- invalid chat id
- Telegram API temporarily unavailable

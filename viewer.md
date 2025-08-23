```bash
    curl -i -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"invitee.test1@example.com","password":"StrongPass_123"}'

```

```json
{
  "ok": true,
  "user": { "id": "cmenrtf1b00069yo946tkocqp", "email": "invitee.test1@example.com" },
  "session": { "expiresAt": "2025-08-30T04:40:07.059Z" }
}
```

set-cookie: insightos.sid=04fe699aed6e2941b4b93d501a89c035d48c013e1525fa6cb49b3fc1f71b54b8; Path=/; Expires=Sat, 30 Aug 2025 04:40:06 GMT; Max-Age=604799; HttpOnly; SameSite=lax

### login

```bash
curl -i -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"invitee.test1@example.com","password":"StrongPass_123"}'
```

**output**

```bash
{"ok":true,"user":{"id":"cmenrtf1b00069yo946tkocqp","email":"invitee.test1@example.com"}}
```

set-cookie: insightos.sid=9ac9e13c5c8c62cd653aa3b55aeb41d14d131fcaf9e103b8acd70527351394fa; Path=/; Expires=Sat, 30 Aug 2025 05:03:13 GMT; HttpOnly; SameSite=lax

### Accept the invite

```bash
curl -i -X POST "http://localhost:3000/api/invites/accept" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat invitee.cookie)" \
  -d "{\"token\":\"60985ef3-5766-427b-a29b-ed5dba8eefab\"}"
```

**output**

```bash
{"ok":true,"joined":true,"alreadyMember":false,"workspaceId":"cmenrft4j00019yo9jbo9luya","role":"VIEWER"}
```

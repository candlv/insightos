```Bash
curl -i -X POST "http://localhost:3000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner.test1@example.com","password":"StrongPass_123"}'
```

```JSON
{"ok":true,
    "user":{
        "id":"cmenrfsxd00009yo9xq0o2h7n",
        "email":"owner.test1@example.com"},
        "session":{"expiresAt":"2025-08-30T04:29:32.182Z"
    }
}
```

insightos.sid=ba9cb026338db29c1a10ab4456e3216ff6f64e7fdece0165e9a5cd31ac188739

### login

```bash
curl -i -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner.test1@example.com","password":"StrongPass_123"}'
```

**output**

```bash
{
    "ok":true,
    "user":{
    "id":"cmenrfsxd00009yo9xq0o2h7n",
    "email":"owner.test1@example.com"
    }
}
```

set-cookie: insightos.sid=b4918f7b59de8c87656320d682d9f9a5dc5b1f4abdd740b065467a731943e77f; Path=/; Expires=Sat, 30 Aug 2025 04:54:51 GMT; HttpOnly; SameSite=lax

### Me

```bash
curl -s "http://localhost:3000/api/auth/me
" \
  -H "Cookie: $(cat owner.cookie)" | jq .
{
  "ok": true,
  "user": {
    "id": "cmenrfsxd00009yo9xq0o2h7n",
    "email": "owner.test1@example.com"
  },
  "memberships": [
    {
      "workspaceId": "cmenrft4j00019yo9jbo9luya",
      "role": "OWNER"
    }
  ]
}
```

### invite

```bash
curl -s -i -X POST "http://localhost:3000/api/workspaces/cmenrft4j00019yo9jbo9luya/invites" \
  -H "Content-Type: application/json" \
  -H "Cookie: $(cat owner.cookie)" \
  -d '{"email":"invitee.test1@example.com"}'

```

**output**

```bash
{
    "ok":true,
    "invite"{
        "token":"60985ef3-5766-427b-a29b-ed5dba8eefab","email":"invitee.test1@example.com","expiresAt":"2025-08-30T05:06:34.544Z","link":"http://localhost:3000/join/60985ef3-5766-427b-a29b-ed5dba8eefab"
        }
}
```

### Members list

```bash
curl -s "http://localhost:3000/api/workspaces/cmenrft4j00019yo9jbo9luya/members" \
  -H "Cookie: $(cat owner.cookie)" | jq .
```

**output**

```bash
{
 "ok": true,
 "members": [
   {
     "id": "cmenrtf1b00069yo946tkocqp",
     "email": "invitee.test1@example.com",
     "role": "VIEWER"
   },
   {
     "id": "cmenrfsxd00009yo9xq0o2h7n",
     "email": "owner.test1@example.com",
     "role": "OWNER"
   }
 ]
}
```

#!/usr/bin/env bash
# One-shot cloud deploy: Supabase (DB + functions) and Vercel.
# Usage:
#   export SUPABASE_ACCESS_TOKEN=sbp_...   VERCEL_TOKEN=vcp_...
#   export ADMIN_EMAIL=you@example.com
#   bash scripts/deploy.sh
set -euo pipefail
REF=${SUPABASE_REF:-aqgcylzmznifryfctrou}
URL="https://$REF.supabase.co"
ANON=${SUPABASE_ANON_KEY:-sb_publishable_eR1wyqRiYhG5223gUKnR2A_J2VEVe0Z}
: "${SUPABASE_ACCESS_TOKEN:?}" "${VERCEL_TOKEN:?}" "${ADMIN_EMAIL:?}"
API=https://api.supabase.com/v1/projects/$REF
auth=(-H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" -H "Content-Type: application/json")

sql() { jq -n --arg q "$1" '{query:$q}' | curl -sf "${auth[@]}" -X POST "$API/database/query" -d @-; echo; }

echo "== 1. Migrations"
for f in supabase/migrations/*.sql; do echo "-> $f"; sql "$(cat "$f")" >/dev/null; done

echo "== 2. Expose schema lugu"
curl -sf "${auth[@]}" -X PATCH "$API/postgrest" -d '{"db_schema":"public,graphql_public,lugu"}' >/dev/null

echo "== 3. Auth: no public sign-up, no email confirm"
curl -sf "${auth[@]}" -X PATCH "$API/config/auth" -d '{"disable_signup":true,"mailer_autoconfirm":true}' >/dev/null

echo "== 4. Vercel"
npx -y vercel@latest link --yes --project lugu-learn --token "$VERCEL_TOKEN" >/dev/null
for k in VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY; do
  v=$([ $k = VITE_SUPABASE_URL ] && echo "$URL" || echo "$ANON")
  npx -y vercel@latest env rm $k production --yes --token "$VERCEL_TOKEN" >/dev/null 2>&1 || true
  printf %s "$v" | npx -y vercel@latest env add $k production --token "$VERCEL_TOKEN" >/dev/null
done
SITE=$(npx -y vercel@latest deploy --prod --yes --token "$VERCEL_TOKEN" | tail -1)
echo "Deployed: $SITE"

echo "== 5. Edge functions"
npx -y supabase@latest secrets set --project-ref "$REF" LUGU_ALLOWED_ORIGINS="$SITE,https://lugu-learn.vercel.app" LUGU_INTERNAL_SECRET="$(openssl rand -hex 32)"
npx -y supabase@latest functions deploy admin-students process-deletion ai-generate ai-insights --project-ref "$REF" --use-api
curl -sf "${auth[@]}" -X PATCH "$API/config/auth" -d "{\"site_url\":\"$SITE\"}" >/dev/null

echo "== 6. Admin user"
PW=$(openssl rand -base64 12)
sql "insert into auth.users (instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,created_at,updated_at,raw_app_meta_data,raw_user_meta_data)
 values ('00000000-0000-0000-0000-000000000000',gen_random_uuid(),'authenticated','authenticated','$ADMIN_EMAIL',crypt('$PW',gen_salt('bf')),now(),now(),now(),'{\"provider\":\"email\",\"providers\":[\"email\"]}','{}')
 on conflict do nothing;
 insert into auth.identities (id,user_id,provider_id,identity_data,provider,created_at,updated_at)
 select gen_random_uuid(),id,id::text,jsonb_build_object('sub',id::text,'email',email),'email',now(),now() from auth.users where email='$ADMIN_EMAIL'
 on conflict do nothing;
 insert into lugu.profiles (user_id, role) select id,'admin' from auth.users where email='$ADMIN_EMAIL' on conflict do nothing;" >/dev/null
echo "Admin: $ADMIN_EMAIL / $PW  (change after first login)"
echo "Done: $SITE"

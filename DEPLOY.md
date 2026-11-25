# Deploy (Vercel + Supabase, ücretsiz)

## Tamamlananlar
- [x] Kod incelendi, `pnpm build` başarılı
- [x] `main` branch oluşturuldu ve pushlandı (`48f62c9`)
- [x] Supabase projesi: `aqgcylzmznifryfctrou` → `https://aqgcylzmznifryfctrou.supabase.co`
- [x] Publishable key: `sb_publishable_eR1wyqRiYhG5223gUKnR2A_J2VEVe0Z` (gizli değil)
- [x] Supabase + Vercel token'ları oluşturuldu
- [x] Tek komutluk kurulum script'i: `scripts/deploy.sh`

## Engel
Claude bulut oturumunun ağı Supabase/Vercel API'lerini engelliyor. Mobil uygulamada ayar bulunamadı.

## Evde yapılacaklar (bilgisayarda)
1. **Token'ları yenile** (sohbette açıkta kaldılar): eskileri sil, yenilerini oluştur
   - Supabase: https://supabase.com/dashboard/account/tokens
   - Vercel: https://vercel.com/account/settings/tokens
2. Yolu seç:

### Yol A — Claude yapsın
- https://claude.ai/code/session_01SBfxnbEjmuKQAhZtp7yTWT aç → "devam et" yaz
- Çıkan ağ izni kartını onayla (`api.supabase.com`, `api.vercel.com`, `aqgcylzmznifryfctrou.supabase.co`)
- Token formuna yeni token'ları gir, admin e-postanı yaz

### Yol B — Kendin çalıştır (kendi PC'nde, repo içinde)
```sh
git fetch origin && git checkout claude/vercel-deploy-setup-k14v56
export SUPABASE_ACCESS_TOKEN=sbp_YENI
export VERCEL_TOKEN=vcp_YENI
export ADMIN_EMAIL=senin@epostan.com
bash scripts/deploy.sh     # jq, openssl, node gerekli
```
Script şunları yapar: migration'lar → `lugu` şemasını açar → kayıt kapalı/e-posta onayı kapalı → Vercel env + prod deploy → edge function'lar → admin hesabı (şifreyi ekrana basar).
Not: migration'lar yalnızca bir kez çalışır; script ikinci kez çalışırsa 1. adımda durur.

## Deploy sonrası kontrol
- Siteye admin olarak gir, şifreni değiştir
- Bir öğrenci oluştur, gizli pencerede öğrenci olarak gir
- AI kapalı (`VITE_AI_ENABLED`), deneme için gerekmez

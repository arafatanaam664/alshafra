# 46 — Environment Configuration

**Never commit values.** Names only.

## Public (Astro `PUBLIC_*`)

- `PUBLIC_SITE_URL`  
- `PUBLIC_ADSENSE_CLIENT`  
- `PUBLIC_GA_ID`  
- `PUBLIC_TURNSTILE_SITE_KEY`  
- `PUBLIC_R2_PUBLIC_BASE_URL`

## Server

- `SUPABASE_URL`  
- `SUPABASE_ANON_KEY`  
- `SUPABASE_SERVICE_ROLE_KEY`  
- `R2_ACCOUNT_ID` `R2_ACCESS_KEY_ID` `R2_SECRET_ACCESS_KEY` `R2_BUCKET` `R2_ENDPOINT` `R2_REGION` `MEDIA_DRIVER` `MEDIA_LOCAL_DIR`  
- `INDEXNOW_KEY`  
- `SOCIAL_TOKEN_KEY`  
- `GOOGLE_OAUTH_CLIENT_ID` `GOOGLE_OAUTH_CLIENT_SECRET`  
- `ADSENSE_SLOTS`  
- `CRON_SECRET`

## Environments

`development` | `preview` | `production`. Flags table `environment` column can be `all` or specific.

Preview: `PUBLIC_SITE_URL` = preview host, `X-Robots-Tag: noindex`.

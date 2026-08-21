# @alshafra/media

Editorial media pipeline. Bytes live on a `StorageProvider` (memory / local disk / Cloudflare R2). Postgres stores metadata only.

R2 is **optional until launch**. Without keys, uploads go to `.data/media` (gitignored).

Never import this package from browser bundles except `./public`.

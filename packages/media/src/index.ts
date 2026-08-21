export type {
  MediaVariantName,
  MediaVisibility,
  MediaDriver,
  StorageObject,
  StorageProvider,
  MediaLimits,
  ValidatedUpload,
  MediaRecord,
  VariantPlan,
  IngestInput,
  IngestResult,
} from './types';
export { mediaObjectKey, extForMime } from './keys';
export {
  ALLOWED_IMAGE_TYPES,
  EDITORIAL_LIMITS,
  UGC_LIMITS,
  VARIANT_PLAN,
  looksLikeSvg,
  sniffImageMime,
  sha256Hex,
  validateEditorialImage,
} from './validate';
export { readImageSize, stripJpegExif } from './dimensions';
export { MemoryStorage, LocalDiskStorage } from './storage';
export { signAwsV4 } from './aws4';
export { R2Storage, buildR2Request, r2Endpoint, r2ObjectUrl, type R2Config } from './r2';
export {
  readMediaEnv,
  r2ConfigFromEnv,
  isR2Configured,
  resolveMediaDriver,
  createStorageFromEnv,
  mediaStatus,
  type MediaEnv,
} from './config';
export { publicObjectUrl, readPublicMediaBase, normalizePublicBase } from './public';
export { ingestEditorial } from './ingest';
export { listMediaLibrary, getMedia, updateMediaMeta, softDeleteMedia, readMediaBytes } from './library';
export { gcCandidates, runMediaGc } from './gc';
export { decodeBase64Upload } from './decode';

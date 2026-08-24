export type DeployTriggerStatus = 'triggered' | 'failed' | 'not_configured';
export type SnapshotUploadStatus = 'uploaded' | 'failed' | 'not_configured';

function hookUrl(env: NodeJS.ProcessEnv = process.env): string {
  return (env.ALSHAFRA_DEPLOY_HOOK_URL || env.VERCEL_DEPLOY_HOOK_URL || '').trim();
}

/**
 * Fire a host rebuild (Vercel deploy hook). Never log or return the URL.
 * A triggered rebuild is not the same as “the visitor sees the new snapshot”.
 */
export async function triggerProductionDeploy(
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ status: DeployTriggerStatus; error?: string }> {
  const url = hookUrl(env);
  if (!url) return { status: 'not_configured' };
  try {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) return { status: 'failed', error: `http_${response.status}` };
    return { status: 'triggered' };
  } catch {
    return { status: 'failed', error: 'network' };
  }
}

export async function uploadPublicSnapshot(
  body: string,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ status: SnapshotUploadStatus; error?: string }> {
  const url = (env.ALSHAFRA_SNAPSHOT_PUT_URL || '').trim();
  if (!url) return { status: 'not_configured' };
  const token = (env.ALSHAFRA_SNAPSHOT_TOKEN || '').trim();
  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body,
    });
    if (!response.ok) return { status: 'failed', error: `http_${response.status}` };
    return { status: 'uploaded' };
  } catch {
    return { status: 'failed', error: 'network' };
  }
}

export function publishHonestyNote(input: {
  upload: SnapshotUploadStatus;
  deploy: DeployTriggerStatus;
}): { live: boolean; note: string } {
  if (input.upload === 'uploaded' && input.deploy === 'triggered') {
    return {
      live: false,
      note: 'اللقطة رُفعت وبُدئ بناء الإنتاج. الزائر يرى التغيير بعد اكتمال البناء، وليس في هذه اللحظة.',
    };
  }
  if (input.deploy === 'triggered' && input.upload === 'not_configured') {
    return {
      live: false,
      note: 'بُدئ بناء الإنتاج، لكن اللقطة الجديدة ليست على مسار البناء. اضبط ALSHAFRA_SNAPSHOT_PUT_URL و ALSHAFRA_SNAPSHOT_URL.',
    };
  }
  if (input.upload === 'failed' || input.deploy === 'failed') {
    return {
      live: false,
      note: 'حُفظت اللقطة محلياً. فشل رفعها أو إطلاق البناء. المحتوى في قاعدة البيانات لم يُفقد.',
    };
  }
  return {
    live: false,
    note: 'اللقطة جاهزة محلياً. الموقع الحي لم يُحدَّث. احفظ ثم انشر ثم أطلق البناء بعد ضبط خطاف النشر.',
  };
}

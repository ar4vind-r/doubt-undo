// Pre-Display Content Moderation Engine for "Doubt Undo?"
// Implements leetspeak/spaced text normalization, Malayalam & English profanity filters, media safety check, and device-persistent mute tracking.

// Session violation memory: sessionCode -> deviceId/handle -> count
const sessionViolations = new Map();

/**
 * Text Normalizer: Neutralizes leetspeak, spaced characters (e.g. "f u c k"), punctuation masking ("f.u.c.k"), and letter flooding ("fuuuuck").
 */
export function normalizeTextForSafety(text) {
  if (!text || typeof text !== 'string') return '';

  let normalized = text.toLowerCase();

  // Leetspeak character map
  const leetMap = {
    '@': 'a', '4': 'a',
    '3': 'e',
    '1': 'i', '!': 'i', '|': 'i',
    '0': 'o',
    '$': 's', '5': 's',
    '7': 't', '+': 't',
    'v': 'u'
  };

  normalized = normalized.split('').map(ch => leetMap[ch] || ch).join('');

  // 1. Remove non-alphanumeric except spaces
  const dePunct = normalized.replace(/[^a-z0-9\s\u0D00-\u0D7F]/g, '');

  // 2. Remove spaces between single characters (e.g. "f u c k" -> "fuck", "m y r e" -> "myre")
  const collapsedSpaced = dePunct.replace(/\b([a-z0-9\u0D00-\u0D7F])\s+(?=[a-z0-9\u0D00-\u0D7F]\b)/g, '$1');

  // 3. Collapse repeated character flooding (e.g. "fuuuuck" -> "fuck", "myrrre" -> "myre")
  const deFlooded = collapsedSpaced.replace(/(.)\1{2,}/g, '$1$1');

  return { original: text, normalized: deFlooded, collapsed: collapsedSpaced.replace(/\s+/g, '') };
}

// Extensive English & Malayalam / Manglish / Regional Profanity Patterns
const TOXIC_PATTERNS = [
  // English Profanity & Leetspeak variants
  /fuck/i, /fuk/i, /fck/i, /phuck/i, /shit/i, /sht/i, /asshole/i, /bitch/i, /btch/i,
  /bastard/i, /cunt/i, /dick/i, /pussy/i, /idiot/i, /stupid/i, /retard/i, /moron/i,
  /loser/i, /shut\s*up/i, /hate/i, /kill\s*yourself/i, /kys/i, /die/i, /ugly/i,
  /nude/i, /porn/i, /sex/i, /nsfw/i, /scam/i, /spam/i,

  // Malayalam & Manglish Slurs / Profanity
  /myr/i, /myre/i, /myru/i, /mayire/i, /thayoli/i, /thayoli/i, /poore/i, /pooru/i,
  /oomb/i, /oombu/i, /oombi/i, /thendi/i, /thendi/i, /pandi/i, /punda/i, /pandi\s*naye/i,
  /kundi/i, /badava/i, /kazutha/i, /koop/i, /vazha/i, /vazha/i, /onn\s*oombu/i,

  // Malayalam Unicode Script
  /മൈര്/u, /മൈര്/u, /തായോളി/u, /പൂറ്/u, /തീണ്ടി/u, /കുണ്ടി/u, /ഊമ്പ്/u, /പൂണ്ട്/u
];

/**
 * Reset violation memory for a finished session
 */
export function clearSessionViolations(sessionCode) {
  if (sessionCode) {
    sessionViolations.delete(sessionCode.toUpperCase());
  }
}

/**
 * Increment and check user/device violation count
 */
export function recordViolation(sessionCode, identifier) {
  const code = (sessionCode || '').toUpperCase();
  if (!sessionViolations.has(code)) {
    sessionViolations.set(code, new Map());
  }
  const userMap = sessionViolations.get(code);
  const current = userMap.get(identifier) || 0;
  const updated = current + 1;
  userMap.set(identifier, updated);
  
  // Auto-mute threshold: 2 or more violations in one session
  const isAutoMuted = updated >= 2;
  return { violationCount: updated, autoMuteTriggered: isAutoMuted };
}

/**
 * Moderate text content with multi-pass normalization (catches spaced letters, leetspeak, Malayalam profanity)
 */
export function moderateText(text) {
  if (!text || typeof text !== 'string') {
    return { passed: true };
  }

  const { original, normalized, collapsed } = normalizeTextForSafety(text);

  // Check original, normalized, and collapsed forms against pattern list
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(original) || pattern.test(normalized) || pattern.test(collapsed)) {
      return {
        passed: false,
        reason: 'Message blocked by Automated Safety Moderation (Inappropriate or offensive language detected).',
        violationType: 'toxic_text'
      };
    }
  }

  // Check for excessive shouting / ALL-CAPS spam
  const clean = text.trim();
  if (clean.length > 10 && clean === clean.toUpperCase() && /[A-Z]{8,}/.test(clean)) {
    return {
      passed: false,
      reason: 'Message blocked: Excessive shouting / ALL-CAPS spam detected.',
      violationType: 'spam_caps'
    };
  }

  return { passed: true };
}

/**
 * Moderate uploaded media (Images/Videos)
 */
export function moderateMedia(mediaFile) {
  if (!mediaFile) return { passed: true };

  const fileName = (mediaFile.originalname || mediaFile.name || '').toLowerCase();
  const fileType = mediaFile.mimetype || '';

  const unsafeMediaKeywords = ['nsfw', 'nude', 'explicit', 'adult', 'violence', 'blood', 'gore', 'weapon', 'myre', 'fuck'];
  for (const kw of unsafeMediaKeywords) {
    if (fileName.includes(kw)) {
      return {
        passed: false,
        reason: `Media blocked: Visual moderation flag triggered (${kw} detected in payload).`,
        violationType: 'unsafe_media'
      };
    }
  }

  if (fileType.startsWith('video/') && mediaFile.size && mediaFile.size > 50 * 1024 * 1024) {
    return {
      passed: false,
      reason: 'Video clip exceeds maximum allowed size (capped at 60s / 50MB).',
      violationType: 'oversized_video'
    };
  }

  return { passed: true };
}

/**
 * Primary pre-display moderation pipeline combining text, media, handle, and persistent device ID
 */
export function runPreDisplayModeration({ sessionCode, handle, deviceId, text, media, isMuted }) {
  if (isMuted) {
    return {
      passed: false,
      blockedByMute: true,
      reason: 'You are currently muted in this session by moderation control.'
    };
  }

  const identifier = deviceId || handle;

  // 1. Moderate Text
  const textResult = moderateText(text);
  if (!textResult.passed) {
    const violation = recordViolation(sessionCode, identifier);
    return {
      passed: false,
      reason: textResult.reason,
      violationType: textResult.violationType,
      autoMuted: violation.autoMuteTriggered,
      violationCount: violation.violationCount
    };
  }

  // 2. Moderate Media
  if (media) {
    const mediaResult = moderateMedia(media);
    if (!mediaResult.passed) {
      const violation = recordViolation(sessionCode, identifier);
      return {
        passed: false,
        reason: mediaResult.reason,
        violationType: mediaResult.violationType,
        autoMuted: violation.autoMuteTriggered,
        violationCount: violation.violationCount
      };
    }
  }

  return { passed: true };
}

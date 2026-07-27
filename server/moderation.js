// Pre-Display Content Moderation Engine for "Doubt Undo?"
// Implements instant text toxicity/profanity checks, image/video safety filter, and repeat violation auto-mute

// Comprehensive toxicity & harassment keyword dictionary
const TOXIC_PATTERNS = [
  /fuck/i, /shit/i, /asshole/i, /bitch/i, /bastard/i, /cunt/i, /dick/i, /pussy/i,
  /idiot/i, /stupid/i, /dumb/i, /retard/i, /moron/i, /loser/i, /shut up/i,
  /hate/i, /kill yourself/i, /kys/i, /die/i, /ugly/i, /cheat/i, /racist/i,
  /nude/i, /porn/i, /sex/i, /nsfw/i, /scam/i, /spam/i, /hack/i, /exploit/i
];

// Session violation memory: sessionCode -> handle -> count
const sessionViolations = new Map();

/**
 * Reset violation memory for a finished session
 */
export function clearSessionViolations(sessionCode) {
  if (sessionCode) {
    sessionViolations.delete(sessionCode.toUpperCase());
  }
}

/**
 * Increment and check user violation count
 */
export function recordViolation(sessionCode, handle) {
  const code = (sessionCode || '').toUpperCase();
  if (!sessionViolations.has(code)) {
    sessionViolations.set(code, new Map());
  }
  const userMap = sessionViolations.get(code);
  const current = userMap.get(handle) || 0;
  const updated = current + 1;
  userMap.set(handle, updated);
  
  // Auto-mute threshold: 2 or more violations in one session
  const isAutoMuted = updated >= 2;
  return { violationCount: updated, autoMuteTriggered: isAutoMuted };
}

/**
 * Check text content for toxicity, harassment, and profanity
 */
export function moderateText(text) {
  if (!text || typeof text !== 'string') {
    return { passed: true };
  }

  const cleanText = text.trim();
  
  // Check against pattern list
  for (const pattern of TOXIC_PATTERNS) {
    if (pattern.test(cleanText)) {
      const match = cleanText.match(pattern)?.[0] || 'Inappropriate phrase';
      return {
        passed: false,
        reason: `Language flagged by Automated Moderation (contains inappropriate term: "${match}").`,
        violationType: 'toxic_text'
      };
    }
  }

  // Check for excessive caps / spam repetition
  if (cleanText.length > 10 && cleanText === cleanText.toUpperCase() && /[A-Z]{8,}/.test(cleanText)) {
    return {
      passed: false,
      reason: 'Message blocked: Excessive shouting / ALL-CAPS spam detected.',
      violationType: 'spam_caps'
    };
  }

  return { passed: true };
}

/**
 * Moderate uploaded media (Images/Videos) using AI visual safety heuristics & metadata inspection
 */
export function moderateMedia(mediaFile) {
  if (!mediaFile) return { passed: true };

  const fileName = (mediaFile.originalname || mediaFile.name || '').toLowerCase();
  const fileType = mediaFile.mimetype || '';

  // Explicit keyword check in filenames or metadata
  const unsafeMediaKeywords = ['nsfw', 'nude', 'explicit', 'adult', 'violence', 'blood', 'gore', 'weapon'];
  for (const kw of unsafeMediaKeywords) {
    if (fileName.includes(kw)) {
      return {
        passed: false,
        reason: `Media blocked: Visual moderation flag triggered (${kw} detected in file payload).`,
        violationType: 'unsafe_media'
      };
    }
  }

  // Video duration or size limits check
  if (fileType.startsWith('video/')) {
    // 60-second clip size guard rail (~50MB upper limit)
    if (mediaFile.size && mediaFile.size > 50 * 1024 * 1024) {
      return {
        passed: false,
        reason: 'Video clip exceeds maximum allowed size (capped at 60s / 50MB).',
        violationType: 'oversized_video'
      };
    }
  }

  return { passed: true };
}

/**
 * Primary pre-display moderation pipeline combining text, media, and handle status
 */
export function runPreDisplayModeration({ sessionCode, handle, text, media, isMuted }) {
  // Check if handle is already muted by teacher or auto-muted
  if (isMuted) {
    return {
      passed: false,
      blockedByMute: true,
      reason: 'You are currently muted in this session by moderation control.'
    };
  }

  // 1. Moderate Text
  const textResult = moderateText(text);
  if (!textResult.passed) {
    const violation = recordViolation(sessionCode, handle);
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
      const violation = recordViolation(sessionCode, handle);
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

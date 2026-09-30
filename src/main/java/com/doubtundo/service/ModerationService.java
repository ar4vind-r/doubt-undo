package com.doubtundo.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

/**
 * ModerationService: Multi-pass text & media moderation engine.
 * Supports Malayalam script, Manglish, Leetspeak normalization, spaced text, and auto-mute.
 */
@Service
public class ModerationService {

    private final Map<String, Map<String, Integer>> sessionViolations = new ConcurrentHashMap<>();

    private static final List<Pattern> TOXIC_PATTERNS = List.of(
            // English Profanity & Leetspeak
            Pattern.compile("fuck", Pattern.CASE_INSENSITIVE),
            Pattern.compile("fuk", Pattern.CASE_INSENSITIVE),
            Pattern.compile("fck", Pattern.CASE_INSENSITIVE),
            Pattern.compile("phuck", Pattern.CASE_INSENSITIVE),
            Pattern.compile("shit", Pattern.CASE_INSENSITIVE),
            Pattern.compile("sht", Pattern.CASE_INSENSITIVE),
            Pattern.compile("asshole", Pattern.CASE_INSENSITIVE),
            Pattern.compile("bitch", Pattern.CASE_INSENSITIVE),
            Pattern.compile("bastard", Pattern.CASE_INSENSITIVE),
            Pattern.compile("cunt", Pattern.CASE_INSENSITIVE),
            Pattern.compile("dick", Pattern.CASE_INSENSITIVE),
            Pattern.compile("pussy", Pattern.CASE_INSENSITIVE),
            Pattern.compile("idiot", Pattern.CASE_INSENSITIVE),
            Pattern.compile("stupid", Pattern.CASE_INSENSITIVE),
            Pattern.compile("retard", Pattern.CASE_INSENSITIVE),
            Pattern.compile("moron", Pattern.CASE_INSENSITIVE),
            Pattern.compile("kys", Pattern.CASE_INSENSITIVE),
            Pattern.compile("nude", Pattern.CASE_INSENSITIVE),
            Pattern.compile("porn", Pattern.CASE_INSENSITIVE),

            // Malayalam & Manglish Slurs
            Pattern.compile("myr", Pattern.CASE_INSENSITIVE),
            Pattern.compile("myre", Pattern.CASE_INSENSITIVE),
            Pattern.compile("myru", Pattern.CASE_INSENSITIVE),
            Pattern.compile("mayire", Pattern.CASE_INSENSITIVE),
            Pattern.compile("thayoli", Pattern.CASE_INSENSITIVE),
            Pattern.compile("poore", Pattern.CASE_INSENSITIVE),
            Pattern.compile("pooru", Pattern.CASE_INSENSITIVE),
            Pattern.compile("oomb", Pattern.CASE_INSENSITIVE),
            Pattern.compile("oombu", Pattern.CASE_INSENSITIVE),
            Pattern.compile("thendi", Pattern.CASE_INSENSITIVE),
            Pattern.compile("pandi", Pattern.CASE_INSENSITIVE),
            Pattern.compile("punda", Pattern.CASE_INSENSITIVE),
            Pattern.compile("kundi", Pattern.CASE_INSENSITIVE),

            // Malayalam Unicode Script
            Pattern.compile("മൈര്", Pattern.UNICODE_CHARACTER_CLASS),
            Pattern.compile("തായോളി", Pattern.UNICODE_CHARACTER_CLASS),
            Pattern.compile("പൂറ്", Pattern.UNICODE_CHARACTER_CLASS),
            Pattern.compile("തീണ്ടി", Pattern.UNICODE_CHARACTER_CLASS),
            Pattern.compile("കുണ്ടി", Pattern.UNICODE_CHARACTER_CLASS),
            Pattern.compile("ഊമ്പ്", Pattern.UNICODE_CHARACTER_CLASS)
    );

    private static final Map<Character, Character> LEET_MAP = Map.ofEntries(
            Map.entry('@', 'a'), Map.entry('4', 'a'),
            Map.entry('3', 'e'),
            Map.entry('1', 'i'), Map.entry('!', 'i'), Map.entry('|', 'i'),
            Map.entry('0', 'o'),
            Map.entry('$', 's'), Map.entry('5', 's'),
            Map.entry('7', 't'), Map.entry('+', 't'),
            Map.entry('v', 'u')
    );

    public record ModerationResult(boolean passed, String reason, String violationType, boolean autoMuted, int violationCount) {}

    public ModerationResult runPreDisplayModeration(String roomCode, String handle, String deviceId, String text, String mediaName, String mediaType, boolean isMuted) {
        if (isMuted) {
            return new ModerationResult(false, "You are currently muted in this session by moderation control.", "muted", false, 0);
        }

        String identifier = (deviceId != null && !deviceId.isEmpty()) ? deviceId : handle;

        // 1. Moderate Text
        if (text != null && !text.trim().isEmpty()) {
            NormalizedText norm = normalizeTextForSafety(text);
            for (Pattern pattern : TOXIC_PATTERNS) {
                if (pattern.matcher(norm.original).find() || pattern.matcher(norm.normalized).find() || pattern.matcher(norm.collapsed).find()) {
                    ViolationRecord viol = recordViolation(roomCode, identifier);
                    return new ModerationResult(false, "Message blocked by Automated Safety Moderation (Inappropriate or offensive language detected).", "toxic_text", viol.autoMuteTriggered, viol.count);
                }
            }

            // CAPS check
            String clean = text.trim();
            if (clean.length() > 10 && clean.equals(clean.toUpperCase()) && clean.matches(".*[A-Z]{8,}.*")) {
                ViolationRecord viol = recordViolation(roomCode, identifier);
                return new ModerationResult(false, "Message blocked: Excessive shouting / ALL-CAPS spam detected.", "spam_caps", viol.autoMuteTriggered, viol.count);
            }
        }

        // 2. Moderate Media
        if (mediaName != null && !mediaName.isEmpty()) {
            String lowerName = mediaName.toLowerCase();
            List<String> unsafe = List.of("nsfw", "nude", "explicit", "adult", "violence", "blood", "gore", "weapon", "myre", "fuck");
            for (String kw : unsafe) {
                if (lowerName.contains(kw)) {
                    ViolationRecord viol = recordViolation(roomCode, identifier);
                    return new ModerationResult(false, "Media blocked: Visual moderation flag triggered (" + kw + " detected).", "unsafe_media", viol.autoMuteTriggered, viol.count);
                }
            }
        }

        return new ModerationResult(true, null, null, false, 0);
    }

    private record NormalizedText(String original, String normalized, String collapsed) {}

    private NormalizedText normalizeTextForSafety(String text) {
        String lower = text.toLowerCase();
        StringBuilder sb = new StringBuilder();
        for (char ch : lower.toCharArray()) {
            sb.append(LEET_MAP.getOrDefault(ch, ch));
        }
        String deLeet = sb.toString();
        String dePunct = deLeet.replaceAll("[^a-z0-9\\s\\u0D00-\\u0D7F]", "");
        String collapsedSpaced = dePunct.replaceAll("(?i)\\b([a-z0-9\\u0D00-\\u0D7F])\\s+(?=[a-z0-9\\u0D00-\\u0D7F]\\b)", "$1");
        String deFlooded = collapsedSpaced.replaceAll("(.)\\1{2,}", "$1$1");
        String collapsed = deFlooded.replaceAll("\\s+", "");

        return new NormalizedText(text, deFlooded, collapsed);
    }

    private record ViolationRecord(int count, boolean autoMuteTriggered) {}

    private synchronized ViolationRecord recordViolation(String roomCode, String identifier) {
        String code = roomCode != null ? roomCode.toUpperCase() : "GLOBAL";
        sessionViolations.putIfAbsent(code, new ConcurrentHashMap<>());
        Map<String, Integer> userMap = sessionViolations.get(code);
        int current = userMap.getOrDefault(identifier, 0) + 1;
        userMap.put(identifier, current);
        boolean autoMute = current >= 2;
        return new ViolationRecord(current, autoMute);
    }

    public void clearSessionViolations(String roomCode) {
        if (roomCode != null) {
            sessionViolations.remove(roomCode.toUpperCase());
        }
    }
}

package com.doubtundo.strategy;

import com.doubtundo.model.Doubt;
import java.util.List;

/**
 * ============================================================================
 * OOP CONCEPT: 6. INTERFACE-BASED DESIGN (Strategy Pattern Implementation)
 * ============================================================================
 * Default implementation of DuplicateDetector strategy using normalized Levenshtein /
 * text similarity checking.
 * ============================================================================
 */
public class DefaultDuplicateDetector implements DuplicateDetector {

    private final double similarityThreshold;

    public DefaultDuplicateDetector() {
        this(0.85); // Default 85% similarity threshold
    }

    public DefaultDuplicateDetector(double similarityThreshold) {
        this.similarityThreshold = similarityThreshold;
    }

    @Override
    public Doubt findDuplicate(String newText, List<Doubt> existingDoubts) {
        if (newText == null || existingDoubts == null || existingDoubts.isEmpty()) {
            return null;
        }

        String normTarget = normalize(newText);
        for (Doubt d : existingDoubts) {
            if (d.isHidden()) continue;
            String normExisting = normalize(d.getText());
            double similarity = calculateSimilarity(normTarget, normExisting);
            if (similarity >= similarityThreshold) {
                return d;
            }
        }
        return null;
    }

    private String normalize(String text) {
        return text.toLowerCase().replaceAll("[^a-z0-9]", "");
    }

    private double calculateSimilarity(String s1, String s2) {
        if (s1.equals(s2)) return 1.0;
        int maxLen = Math.max(s1.length(), s2.length());
        if (maxLen == 0) return 1.0;
        int distance = computeLevenshteinDistance(s1, s2);
        return 1.0 - ((double) distance / maxLen);
    }

    private int computeLevenshteinDistance(String lhs, String rhs) {
        int len0 = lhs.length() + 1;
        int len1 = rhs.length() + 1;

        int[] cost = new int[len0];
        int[] newcost = new int[len0];

        for (int i = 0; i < len0; i++) cost[i] = i;

        for (int j = 1; j < len1; j++) {
            newcost[0] = j;
            for (int i = 1; i < len0; i++) {
                int match = (lhs.charAt(i - 1) == rhs.charAt(j - 1)) ? 0 : 1;
                int cost_replace = cost[i - 1] + match;
                int cost_insert = cost[i] + 1;
                int cost_delete = newcost[i - 1] + 1;
                newcost[i] = Math.min(Math.min(cost_insert, cost_delete), cost_replace);
            }
            int[] swap = cost;
            cost = newcost;
            newcost = swap;
        }

        return cost[len0 - 1];
    }
}

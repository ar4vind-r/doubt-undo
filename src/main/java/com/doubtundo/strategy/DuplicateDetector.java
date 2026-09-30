package com.doubtundo.strategy;

import com.doubtundo.model.Doubt;
import java.util.List;

/**
 * ============================================================================
 * OOP CONCEPT: 6. INTERFACE-BASED DESIGN (Strategy Pattern)
 * ============================================================================
 * Interface defining strategy for duplicate doubt detection and similarity algorithms.
 * ============================================================================
 */
public interface DuplicateDetector {
    /**
     * Finds potential duplicate doubts from an existing list of doubts.
     * @param newText Text of the proposed new doubt
     * @param existingDoubts Current doubts in classroom
     * @return Doubt object if duplicate detected, or null
     */
    Doubt findDuplicate(String newText, List<Doubt> existingDoubts);
}

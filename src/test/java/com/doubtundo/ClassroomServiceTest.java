package com.doubtundo;

import com.doubtundo.exception.DuplicateVoteException;
import com.doubtundo.exception.UnauthorizedActionException;
import com.doubtundo.model.*;
import com.doubtundo.service.ClassroomService;
import com.doubtundo.service.ModerationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ClassroomServiceTest {

    private ClassroomService classroomService;
    private ModerationService moderationService;
    private Classroom classroom;
    private Teacher teacher;
    private Student student;

    @BeforeEach
    void setUp() {
        moderationService = new ModerationService();
        classroomService = new ClassroomService(moderationService);

        classroom = classroomService.createClassroom("Prof. Alan");
        teacher = classroom.getTeacher();
        student = new Student("stud_101", "Student 1");
        classroom.addStudent(student);
    }

    @Test
    @DisplayName("Unit Test 1: Upvoting increases vote count")
    void testUpvoteDoubt() {
        Doubt doubt = classroomService.addDoubt(classroom, student, "What is Polymorphism in Java?");
        assertEquals(0, doubt.getVotes(), "Initial vote count should be 0");

        doubt.upvote("user_1");
        assertEquals(1, doubt.getVotes(), "Upvote count should increase to 1");
    }

    @Test
    @DisplayName("Unit Test 2: Duplicate vote handling throws DuplicateVoteException")
    void testDuplicateVoteException() {
        Doubt doubt = classroomService.addDoubt(classroom, student, "What is Encapsulation?");

        // First vote succeeds
        doubt.upvote("user_1");
        assertEquals(1, doubt.getVotes());

        // Second vote from same user throws DuplicateVoteException
        assertThrows(DuplicateVoteException.class, () -> {
            doubt.upvote("user_1");
        }, "Upvoting twice with same user ID must throw DuplicateVoteException");
    }

    @Test
    @DisplayName("Unit Test 3: Unauthorized answer attempt by Student throws UnauthorizedActionException")
    void testUnauthorizedAnswerException() {
        Doubt doubt = classroomService.addDoubt(classroom, student, "Can students answer doubts?");

        assertThrows(UnauthorizedActionException.class, () -> {
            classroomService.answerDoubt(classroom, student, doubt.getId(), "Students cannot answer");
        }, "Attempting to answer a doubt as a Student must throw UnauthorizedActionException");
    }
}

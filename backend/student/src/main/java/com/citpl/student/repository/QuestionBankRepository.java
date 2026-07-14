package com.citpl.student.repository;

import com.citpl.student.model.QuestionBank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface QuestionBankRepository extends JpaRepository<QuestionBank, Long> {

    List<QuestionBank> findByAssignmentId(Long assignmentId);

    List<QuestionBank> findByAssignmentIdAndQuestionSet(Long assignmentId, Integer questionSet);

    @Modifying
    @Transactional
    void deleteByAssignmentId(Long assignmentId);
}

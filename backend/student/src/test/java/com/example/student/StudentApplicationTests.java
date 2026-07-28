package com.example.student;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.citpl.student.repository.QuestionBankRepository;
import com.citpl.student.model.QuestionBank;
import com.citpl.student.StudentApplication;

@SpringBootTest(classes = StudentApplication.class)
class StudentApplicationTests {

	@Autowired
	private QuestionBankRepository qRepo;

	@Test
	void contextLoads() {
		System.out.println("=== START ASSIGNMENT TEST ===");
		Long assignmentId = 1L; // Assuming assignment 1 is the test session
		java.util.List<QuestionBank> allQuestions = qRepo.findByAssignmentId(assignmentId);
		System.out.println("allQuestions size: " + allQuestions.size());
		
		java.util.Set<Integer> existingSets = allQuestions.stream()
			.map(QuestionBank::getQuestionSet)
			.filter(java.util.Objects::nonNull)
			.collect(java.util.stream.Collectors.toSet());
		System.out.println("existingSets: " + existingSets);
		
		int assignedSet = 1;
		if (!existingSets.isEmpty()) {
			java.util.List<Integer> existingSetsList = new java.util.ArrayList<>(existingSets);
			assignedSet = existingSetsList.get(0);
		}
		System.out.println("assignedSet: " + assignedSet);
		
		java.util.List<QuestionBank> qList = qRepo.findByAssignmentIdAndQuestionSet(assignmentId, assignedSet);
		System.out.println("qList size: " + qList.size());
		
		com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
		java.util.List<java.util.Map<String, Object>> decryptedQuestions = qList.stream()
			.map(q -> {
				try {
					String decryptedStr = com.citpl.student.util.AesUtil.decrypt(q.getEncryptedQuestion());
					java.util.Map<String, Object> qMap = mapper.readValue(decryptedStr, java.util.Map.class);
					qMap.put("id", q.getId());
					qMap.put("questionSet", q.getQuestionSet());
					qMap.put("questionOrder", q.getQuestionOrder());
					return qMap;
				} catch (Exception e) {
					System.out.println("Decryption failed: " + e.getMessage());
					return null;
				}
			})
			.filter(java.util.Objects::nonNull)
			.collect(java.util.stream.Collectors.toList());
			
		System.out.println("decryptedQuestions size: " + decryptedQuestions.size());
		System.out.println("=============================");
	}

}

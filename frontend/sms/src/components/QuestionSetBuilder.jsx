import {
  Box, Button, Grid, TextField, IconButton, Typography, Paper, Radio,
  RadioGroup, FormControlLabel,
} from "@mui/material";
import { Close } from "@mui/icons-material";

/**
 * Shared MCQ question-set builder, used by both admin's AssignmentModal and the
 * instructor's Add Assignment dialog - single source of truth so the two don't
 * drift out of sync with each other.
 *
 * `questions` / `setQuestions` follow the same flat-array shape AssignmentModal
 * already used: [{ id, questionText, options: [string,string,string,string],
 * correctOption, set: 1|2|3|4 }, ...] - this is exactly what gets
 * JSON.stringify'd into questionsJson and sent to the backend, matching what
 * AssignmentServiceImpl.saveQuestions() expects to parse.
 */
export default function QuestionSetBuilder({ questions, setQuestions }) {
  const handleAddQuestionToSet = (setIndex) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        questionText: "",
        options: ["", "", "", ""],
        correctOption: "",
        set: setIndex,
      },
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleOptionChange = (index, optionIdx, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const options = [...(updated[index].options ?? ["", "", "", ""])];
      const oldValue = options[optionIdx];
      options[optionIdx] = value;

      // If this option was the correct answer, keep correctOption pointing at
      // the updated text so editing an option doesn't silently break the answer key.
      const correctOption =
        updated[index].correctOption === oldValue ? value : updated[index].correctOption;

      updated[index] = { ...updated[index], options, correctOption };
      return updated;
    });
  };

  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, color: "#1565C0" }}>
        MCQ Question Bank
      </Typography>

      {[1, 2, 3, 4].map((setNum) => {
        const setQuestionsForNum = questions.filter((q) => Number(q.set) === setNum);

        return (
          <Box key={setNum} sx={{ mb: 4 }}>
            <Box sx={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              mb: 2, bgcolor: "#EFF6FF", p: 1.5, borderRadius: 2, borderLeft: "4px solid #1D4ED8",
            }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#1E3A8A" }}>
                📂 Set {setNum} ({setQuestionsForNum.length} Questions)
              </Typography>
              <Button
                size="small" variant="contained" color="primary"
                onClick={() => handleAddQuestionToSet(setNum)}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                + Add Question
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pl: 1 }}>
              {setQuestionsForNum.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", pl: 1, my: 1 }}>
                  No questions added to Set {setNum} yet.
                </Typography>
              ) : (
                setQuestionsForNum.map((q, localIdx) => {
                  const absIdx = questions.findIndex((item) => item.id === q.id);
                  if (absIdx === -1) return null;
                  const options = q.options ?? ["", "", "", ""];

                  return (
                    <Paper key={q.id} variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: "#F8FAFC" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                        <Typography fontWeight={700} color="text.secondary">
                          Question {localIdx + 1}
                        </Typography>
                        <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(absIdx)}>
                          <Close fontSize="small" />
                        </IconButton>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth size="small" label="Question Text"
                            value={q.questionText}
                            onChange={(e) => handleQuestionChange(absIdx, "questionText", e.target.value)}
                            required
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                            Options — select the radio button next to the correct answer
                          </Typography>
                          <RadioGroup
                            value={q.correctOption ?? ""}
                            onChange={(e) => handleQuestionChange(absIdx, "correctOption", e.target.value)}
                          >
                            {options.map((opt, optIdx) => (
                              <Box key={optIdx} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                <FormControlLabel
                                  value={opt}
                                  control={<Radio size="small" disabled={!opt} />}
                                  label=""
                                  sx={{ mr: 0 }}
                                />
                                <TextField
                                  fullWidth size="small"
                                  label={`Option ${String.fromCharCode(65 + optIdx)}`}
                                  value={opt}
                                  onChange={(e) => handleOptionChange(absIdx, optIdx, e.target.value)}
                                  required
                                />
                              </Box>
                            ))}
                          </RadioGroup>
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
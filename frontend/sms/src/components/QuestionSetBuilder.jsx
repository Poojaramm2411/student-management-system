import {
  Box, Button, Grid, TextField, IconButton, Typography, Paper, MenuItem,
} from "@mui/material";
import { Close } from "@mui/icons-material";

/**
 * Shared question-set builder, used by both admin's AssignmentModal and the
 * instructor's Add Assignment dialog - single source of truth so the two don't
 * drift out of sync with each other.
 *
 * `questions` / `setQuestions` follow the same flat-array shape AssignmentModal
 * already used: [{ id, questionText, set: 1|2|3|4 }, ...] - this is exactly
 * what gets JSON.stringify'd into questionsJson and sent to the backend,
 * matching what AssignmentServiceImpl.saveQuestions() expects to parse.
 * There is no answer key here - questions are open-ended text prompts only.
 */
export default function QuestionSetBuilder({ questions, setQuestions }) {
  const handleAddQuestionToSet = (setIndex) => {
    setQuestions((prev) => [
      ...prev,
      {
        id: Date.now(),
        questionText: "",
        type: "TEXT",
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

  const handleDeleteQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2.5, color: "#1565C0" }}>
        Question Bank
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
                        <Grid item xs={12} sm={8}>
                          <TextField
                            fullWidth size="small" label="Question Text"
                            value={q.questionText}
                            onChange={(e) => handleQuestionChange(absIdx, "questionText", e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            select fullWidth size="small" label="Question Type"
                            value={q.type || "TEXT"}
                            onChange={(e) => {
                              const newType = e.target.value;
                              handleQuestionChange(absIdx, "type", newType);
                              if (newType === "MCQ" && (!q.options || q.options.length === 0)) {
                                handleQuestionChange(absIdx, "options", ["", "", "", ""]);
                                handleQuestionChange(absIdx, "correctOption", "");
                              }
                            }}
                          >
                            <MenuItem value="TEXT">Open-ended Text</MenuItem>
                            <MenuItem value="MCQ">Multiple Choice (MCQ)</MenuItem>
                          </TextField>
                        </Grid>

                        {(q.type === "MCQ") && (
                          <>
                            {[0, 1, 2, 3].map((optIdx) => (
                              <Grid item xs={12} sm={6} key={optIdx}>
                                <TextField
                                  fullWidth size="small"
                                  label={`Option ${optIdx + 1}`}
                                  value={q.options?.[optIdx] || ""}
                                  onChange={(e) => {
                                    const opts = [...(q.options || ["", "", "", ""])];
                                    opts[optIdx] = e.target.value;
                                    handleQuestionChange(absIdx, "options", opts);
                                  }}
                                  required
                                />
                              </Grid>
                            ))}
                            <Grid item xs={12}>
                              <TextField
                                select fullWidth size="small" label="Correct Option"
                                value={q.correctOption || ""}
                                onChange={(e) => handleQuestionChange(absIdx, "correctOption", e.target.value)}
                                required
                                helperText="Select which of the options above is correct"
                              >
                                <MenuItem value="">-- Select Correct Option --</MenuItem>
                                {(q.options || []).map((opt, oIdx) => (
                                  <MenuItem key={oIdx} value={opt} disabled={!opt.trim()}>
                                    {opt.trim() ? `Option ${oIdx + 1}: ${opt}` : `Option ${oIdx + 1} (Empty)`}
                                  </MenuItem>
                                ))}
                              </TextField>
                            </Grid>
                          </>
                        )}
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
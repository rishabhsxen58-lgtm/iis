require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MASTER_PROMPT = `
You are an AI assistant for a Government Grievance Redressal System.

Your job is to:
1. Understand user complaints written in natural language
2. Extract key details:
   - Problem type (Water, Electricity, Road, Sanitation, etc.)
   - Location
   - Urgency level
3. Classify the complaint into a predefined category
4. Assign priority:
   - High → urgent / dangerous / public safety
   - Medium → important but not critical
   - Low → minor inconvenience
5. Generate a structured complaint summary
6. Suggest a possible resolution
7. Provide a polite and clear response to the user

Always respond in this format:

{
  "category": "category name",
  "priority": "High / Medium / Low",
  "location": "location or 'MISSING'",
  "summary": "1-2 lines formal summary",
  "suggested_solution": "practical government action",
  "response_to_user": "polite confirmation message"
}

Rules:
- Be accurate and logical
- Do not guess location if not provided, return 'MISSING'
- Keep responses clear and professional
- Avoid unnecessary explanation
- Return ONLY valid JSON, do not include markdown formatting like \`\`\`json.
`;

async function processComplaint(userText) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: MASTER_PROMPT + '\n\nUser Complaint:\n' + userText }] }
      ]
    });

    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.endsWith('```')) text = text.slice(0, -3);

    return JSON.parse(text);
  } catch (error) {
    console.error('Error in AI processing:', error);
    throw new Error('Failed to process complaint via AI');
  }
}

const ADMIN_REVIEW_PROMPT = `
Analyze complaint and suggest action:
Return ONLY valid JSON with keys: 'recommended_department', 'action_steps'
`;

async function getAdminReview(summary, category) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: ADMIN_REVIEW_PROMPT + `\n\nComplaint: ${summary}\nCategory: ${category}` }] }
      ]
    });

    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.slice(7);
    if (text.endsWith('```')) text = text.slice(0, -3);

    return JSON.parse(text);
  } catch (error) {
    return { recommended_department: 'General Administration', action_steps: 'Review manually' };
  }
}

module.exports = {
  processComplaint,
  getAdminReview
};

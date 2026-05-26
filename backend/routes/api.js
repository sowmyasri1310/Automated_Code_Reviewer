import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { traceable, getCurrentRunTree } from 'langsmith/traceable';
import History from '../models/History.js';

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper to get system instructions based on AI personality
const getSystemInstruction = (personality) => {
  let instructions = 'You are an advanced AI Code Reviewer. Your response MUST be valid JSON matching the requested schema strictly. Do not include markdown code block styling like ```json in your response, just return raw JSON.';
  
  switch (personality) {
    case 'Strict Senior Developer':
      instructions += `
      Your persona: A hyper-critical, direct, no-nonsense Senior Developer.
      Your tone: Direct, authoritative, highly technical, and strictly focused on efficiency, best practices, edge cases, and design patterns.
      Do not sugarcoat. Point out issues directly and explain why they violate production-grade engineering principles.`;
      break;
    case 'Friendly Mentor':
      instructions += `
      Your persona: An encouraging, patient, and supportive software engineering mentor.
      Your tone: Warm, constructive, positive, and highly educational.
      Acknowledge what is good about the user's approach first, then guide them through improvements. Explain concepts using beginner-friendly language and encourage growth.`;
      break;
    case 'Security Expert':
      instructions += `
      Your persona: A paranoid, detail-oriented Application Security (AppSec) Engineer.
      Your tone: Alert, analytical, and highly focused on safety and threat prevention.
      Search strictly for security vulnerabilities, injection risks, memory leaks, exposure of sensitive details, authorization issues, bad cryptography, data sanitation failures, or potential crash vectors.`;
      break;
    case 'FAANG Interviewer':
      instructions += `
      Your persona: A software engineer from a top tech company conducting a technical coding interview.
      Your tone: Professional, analytical, and focused on system performance, data structures, algorithms, and scale.
      Assess the code from an interview context. Grade the choice of data structures, evaluate computational complexity, highlight trade-offs, and suggest optimal algorithmic alternatives.`;
      break;
    default:
      break;
  }
  return instructions;
};

// Traceable wrapper for Code Review
const reviewCodeWithAI = traceable(
  async (prompt, model, modelName, personality) => {
    const runTree = getCurrentRunTree();
    if (runTree) {
      runTree.metadata = {
        ...runTree.metadata,
        ls_provider: "google",
        ls_model_name: modelName,
        personality: personality,
      };
    }
    const result = await model.generateContent(prompt);
    return result.response.text();
  },
  {
    name: "Code Review",
    run_type: "llm"
  }
);

// Traceable wrapper for Code Comparison
const compareCodeWithAI = traceable(
  async (prompt, model, modelName) => {
    const runTree = getCurrentRunTree();
    if (runTree) {
      runTree.metadata = {
        ...runTree.metadata,
        ls_provider: "google",
        ls_model_name: modelName,
      };
    }
    const result = await model.generateContent(prompt);
    return result.response.text();
  },
  {
    name: "Code Comparison",
    run_type: "llm"
  }
);

// @route   POST /api/review
// @desc    Perform code review using Gemini
router.post('/review', async (req, res) => {
  const { code, language, personality } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required for review' });
  }

  try {
    const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: 'Gemini API Key is missing. Please set your key in Settings.' });
    }
    const client = new GoogleGenerativeAI(apiKey);
    const modelName = req.headers['x-gemini-model'] || 'gemini-2.5-flash';
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: getSystemInstruction(personality),
    });

    const prompt = `
    Analyze the following ${language} code and generate a detailed code review in JSON format.
    
    Code to review:
    """
    ${code}
    """

    You MUST return a JSON object with the following schema:
    {
      "bugProbability": 78, // Number from 0 to 100 indicating chance of runtime issues/bugs.
      "errors": [
        {
          "line": 2, // 1-indexed line number where the issue occurs, or null if general
          "message": "Direct explanation of what is wrong",
          "explanation": "Deeper explanation of why this is a mistake"
        }
      ],
      "improvements": [
        {
          "type": "performance", // Choose from: "performance", "security", "readability", "style"
          "message": "High-level summary of the improvement",
          "suggestion": "Specific code fix or style advice"
        }
      ],
      "complexity": {
        "current": "O(n²)", // Big-O string of current code
        "suggested": "O(n)", // Big-O string of optimized code, or the same if already optimal
        "explanation": "Explain why the complexity is what it is and how to optimize it.",
        "chartData": [
          // Represent 5 data points showing the computational growth curve of Current vs Suggested operations.
          // Choose appropriate numbers (e.g. for O(1) ops=1, O(n) ops=N, O(n^2) ops=N*N) to showcase the graph dynamically in the UI.
          { "inputSize": "10", "currentOps": 100, "suggestedOps": 10 },
          { "inputSize": "20", "currentOps": 400, "suggestedOps": 20 },
          { "inputSize": "30", "currentOps": 900, "suggestedOps": 30 },
          { "inputSize": "40", "currentOps": 1600, "suggestedOps": 40 },
          { "inputSize": "50", "currentOps": 2500, "suggestedOps": 50 }
        ]
      },
      "refactoredCode": "The complete rewritten, clean, optimal code based on your feedback.",
      "explainBeginner": {
        "analogies": "A physical or real-world analogy to explain what the code is trying to do and why the current approach is slow or bug-prone.",
        "stepByStep": [
          {
            "lines": "1-3", // Line range
            "explanation": "Beginner friendly explanation of what this block does, line by line."
          }
        ]
      }
    }

    Strictly adhere to the JSON schema. Do not write anything outside of valid JSON. Ensure lines in "stepByStep" reference lines in the original code.
    `;

    const responseText = await reviewCodeWithAI(prompt, model, modelName, personality);
    
    let reviewResult;
    try {
      reviewResult = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON. Raw text was:', responseText);
      return res.status(500).json({ error: 'Failed to generate review in structured JSON format. Please try again.' });
    }

    // Save to Mongoose Database History
    const historyItem = new History({
      code,
      language,
      personality,
      reviewType: 'review',
      result: reviewResult
    });
    
    await historyItem.save();
    
    res.json({
      id: historyItem._id,
      ...reviewResult
    });

  } catch (error) {
    console.error('Review API error:', error);
    res.status(500).json({ error: error.message || 'Server encountered an error during review processing' });
  }
});

// @route   POST /api/compare
// @desc    Compare two different code solutions using Gemini
router.post('/compare', async (req, res) => {
  const { code, codeB, language } = req.body;

  if (!code || !codeB) {
    return res.status(400).json({ error: 'Both Solution A and Solution B are required' });
  }

  try {
    const apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(401).json({ error: 'Gemini API Key is missing. Please set your key in Settings.' });
    }
    const client = new GoogleGenerativeAI(apiKey);
    const modelName = req.headers['x-gemini-model'] || 'gemini-2.5-flash';
    const model = client.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are an elite code architecture analyzer. Compare the two solutions thoroughly and return structured JSON only.',
    });

    const prompt = `
    Compare the following two implementations (Solution A and Solution B) written in ${language}.
    
    Solution A:
    """
    ${code}
    """

    Solution B:
    """
    ${codeB}
    """

    Analyze their performance, readability, scalability, speed, and structural integrity.
    You MUST return a JSON object with the following schema:
    {
      "scoreA": {
        "readability": 85, // Score out of 100
        "speed": 60, // Score out of 100
        "scalability": 50 // Score out of 100
      },
      "scoreB": {
        "readability": 90, // Score out of 100
        "speed": 95, // Score out of 100
        "scalability": 95 // Score out of 100
      },
      "winner": "B", // Must be "A", "B", or "Tie"
      "winnerReason": "High-level summary of why the winner was chosen.",
      "readabilityComparison": "Detailed evaluation comparing the ease of understanding, style, patterns, and naming conventions in both solutions.",
      "speedComparison": "Detailed evaluation of code speed, execution pathways, recursion depth, loop setups, etc.",
      "scalabilityComparison": "Detailed evaluation of memory overhead, memory leaks, ability to handle extreme input growth, and overall architectural scaling capability."
    }

    Strictly adhere to the JSON schema. Do not write anything outside of valid JSON.
    `;

    const responseText = await compareCodeWithAI(prompt, model, modelName);
    
    let compareResult;
    try {
      compareResult = JSON.parse(responseText);
    } catch (parseErr) {
      console.error('Failed to parse comparison as JSON. Raw text was:', responseText);
      return res.status(500).json({ error: 'Failed to generate comparison. Please try again.' });
    }

    // Save to Mongoose Database History
    const historyItem = new History({
      code,
      codeB,
      language,
      personality: 'Code Architect (Compare)',
      reviewType: 'compare',
      result: compareResult
    });
    
    await historyItem.save();
    
    res.json({
      id: historyItem._id,
      ...compareResult
    });

  } catch (error) {
    console.error('Compare API error:', error);
    res.status(500).json({ error: error.message || 'Server encountered an error during comparison processing' });
  }
});

// @route   GET /api/history
// @desc    Get all reviews history
router.get('/history', async (req, res) => {
  try {
    const history = await History.find().sort({ createdAt: -1 }).limit(30);
    res.json(history);
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ error: `Database Connection Issue: ${error.message}. Please verify your MongoDB Atlas settings & ensure IP Whitelist 0.0.0.0/0 is configured.` });
  }
});

// @route   DELETE /api/history/:id
// @desc    Delete a specific history entry
router.delete('/history/:id', async (req, res) => {
  try {
    const historyItem = await History.findById(req.params.id);
    if (!historyItem) {
      return res.status(404).json({ error: 'History record not found' });
    }
    await historyItem.deleteOne();
    res.json({ success: true, message: 'Record deleted from history' });
  } catch (error) {
    console.error('Delete history error:', error);
    res.status(500).json({ error: 'Failed to delete history record' });
  }
});

// Catch-all 404 handler for all other API endpoints
router.use('*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

export default router;


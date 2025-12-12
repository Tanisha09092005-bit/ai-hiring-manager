import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { ResumeAnalysis, JobContext, VideoAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class GeminiService {
  private chatSession: Chat | null = null;
  private mentorSession: Chat | null = null;

  // 1. Analyze the Resume to generate the scorecard
  public async analyzeResume(context: JobContext): Promise<ResumeAnalysis> {
    const prompt = `
      Role: Hiring Manager at ${context.company}
      Target Position: ${context.role}
      
      Analyze the attached resume. 
      1. Assign a match score (0-100).
      2. Predict the probability of passing the resume screen (Low/Medium/High).
      3. Identify top 3 strengths.
      4. Identify top 3 red flags or reasons for rejection.
      5. Provide a brutal 1-sentence summary of why you would or wouldn't hire them.
      6. List 3 topics you want to drill down into during the interview.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: context.resumeMimeType, data: context.resumeBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            passProbability: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            summary: { type: Type.STRING },
            interviewFocus: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ResumeAnalysis;
    }
    throw new Error("Failed to analyze resume");
  }

  // 2. Start the Interview Session
  public startInterview(context: JobContext, analysis: ResumeAnalysis) {
    const systemInstruction = `
      You are a strict, professional, and somewhat skeptical Hiring Manager at ${context.company}.
      You are interviewing a candidate for the ${context.role} position.
      
      You have just reviewed their resume.
      Your analysis summary: "${analysis.summary}"
      Your concerns (Red Flags): ${analysis.redFlags.join(', ')}
      Topics you want to focus on: ${analysis.interviewFocus.join(', ')}

      GOAL: Conduct a realistic 15-minute screening interview. 
      - Start by introducing yourself briefly and asking a specific question about one of the red flags or focus areas.
      - Do not be generic. Reference specific details from their resume if possible (since you have the context).
      - If the candidate gives a vague answer, drill deeper.
      - Be polite but firm.
      - Keep responses concise (under 100 words) to mimic a real conversation.
    `;

    // We use Gemini 3 Pro Preview for better reasoning during the conversation
    this.chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 1024 } // Allow some thinking for complex follow-ups
      }
    });
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) throw new Error("Interview not started");

    const result = await this.chatSession.sendMessageStream({ message });
    let text = '';
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            text += c.text;
        }
    }
    return text;
  }

  // 3. Mentor Chat Stream
  public async *sendMessageStream(message: string): AsyncGenerator<string, void, unknown> {
    if (!this.mentorSession) {
        this.mentorSession = ai.chats.create({
            model: 'gemini-3-pro-preview',
            config: {
                systemInstruction: "You are an expert AI Mentor for a Deep Learning competition. Help users with data preprocessing, model architecture, and debugging.",
                thinkingConfig: { thinkingBudget: 2048 }
            }
        });
    }

    const result = await this.mentorSession.sendMessageStream({ message });
    for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        if (c.text) {
            yield c.text;
        }
    }
  }

  // 4. Evaluate Submission Code
  public async evaluateSubmission(code: string, problem: string): Promise<string> {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Problem Context: ${problem}\n\nCandidate Submission:\n\`\`\`python\n${code}\n\`\`\`\n\nProvide a technical code review. Point out bugs, inefficiencies, and suggest improvements. Be constructive but critical.`,
        config: {
            thinkingConfig: { thinkingBudget: 2048 }
        }
    });
    return response.text || "Unable to evaluate code.";
  }

  // 5. Generate Synthetic Image
  public async generateSyntheticImage(prompt: string): Promise<string | null> {
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-image-preview',
        contents: {
            parts: [{ text: prompt }]
        },
        // responseMimeType and responseSchema are NOT supported for gemini-3-pro-image-preview
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    return null;
  }

  // 6. Analyze Video
  public async analyzeVideo(base64Data: string, mimeType: string): Promise<VideoAnalysisResult> {
    const prompt = `
      Analyze this video for a data science competition dataset.
      Identify the key objects, actions, and generate a summary.
      If there is speech, transcribe it.
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: mimeType, data: base64Data } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    objects: { type: Type.ARRAY, items: { type: Type.STRING } },
                    actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    transcript: { type: Type.STRING }
                }
            }
        }
    });

    if (response.text) {
        return JSON.parse(response.text) as VideoAnalysisResult;
    }
    throw new Error("Failed to analyze video");
  }
}

export const geminiService = new GeminiService();
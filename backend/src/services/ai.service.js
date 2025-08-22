const { GoogleGenAI } = require("@google/genai");

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function generateResponse(content, systemInstruction) {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: content,
        config:{
            temperature: 0.6,
            systemInstruction: systemInstruction
        }
    });
    return response.text
}

async function generateVector(content){
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: content,
        config:{
            outputDimensionality: 768,
        }
    })

    return response.embeddings[0].values
}

module.exports = {generateResponse, generateVector}
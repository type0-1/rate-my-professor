import { NextResponse } from "next/server"
import { Pinecone } from "@pinecone-database/pinecone"
import { GoogleGenerativeAI } from "@google/generative-ai"

const systemPrompt = `You are an AI assistant dedicated to helping students find the most suitable professors based on their needs. Your knowledge base includes professor reviews, ratings, and course details. For each user query, you will employ a RAG (Retrieval-Augmented Generation) system to gather and analyze relevant data, then recommend the top 3 professors who best match the student's criteria.

Your responses should be structured as follows:

A brief acknowledgment of the student's query.
The top 3 professor recommendations, each including:
Professor's name
Subject area
Star rating (out of 5 stars)
A concise summary explaining why this professor is recommended, based on the retrieved reviews
A brief conclusion or additional advice, if applicable.
Guidelines:

Always provide 3 recommendations unless the query is highly specific and fewer options are available.
Base your recommendations solely on the information retrieved, not on any pre-existing knowledge.
If the query is too broad or vague, ask for more details to give accurate recommendations.
Stay impartial and focus on the professors' teaching qualities, not their personal traits.
If there isn't enough data to make a recommendation, inform the user and suggest how they can refine their query.
Present the star rating using stars.
Your goal is to assist students in making well-informed decisions about their course selections by offering clear, concise, and relevant professor recommendations based on their unique needs and preferences.

`

export async function POST(req){
    const data = await req.json()
    const pc = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY
    })
    const index = pc.index('rag').namespace('ns1')
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
    const text = data[data.length-1].content 
    const model = genAI.getGenerativeModel({model:"text-embedding-004"})
    const res = await model.embedContent(text)
    const embedding = res.embedding
    const results = await index.query({
        topK:3,
        includeMetadata:true,
        vector: embedding.values,
        
    })

    let resultString = '\n\nReturned results from vector db (done automatically)'

    results.matches.forEach((match)=>{
        resultString += `\n
        Professor: ${match.id}
        Review: ${match.metadata.stars}
        Subject: ${match.metadata.subject}
        Stars: ${match.metadata.stars}\n\n 
        `
    })

    const model_gen = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const gen_result = await model_gen.generateContent(`${systemPrompt}\nQuery: ${text}\n${data}\n`);
    const response = await gen_result.response.text();
    return new NextResponse(response)
}
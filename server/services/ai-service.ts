import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import { log } from "../vite";

// Initialize AI clients
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025

/**
 * AI service for text and content analysis
 */
export class AIService {
  /**
   * Analyzes a URL for potential threats using AI
   * @param url The URL to analyze
   * @param htmlContent The HTML content of the URL (optional)
   */
  async analyzeUrl(url: string, htmlContent?: string): Promise<{
    isMalicious: boolean;
    confidence: number;
    threatType: string | null;
    explanation: string;
  }> {
    try {
      log(`Analyzing URL with AI: ${url}`, "ai-service");
      
      const contentToAnalyze = htmlContent 
        ? `URL: ${url}\n\nContent: ${htmlContent}`
        : `URL: ${url}`;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: 
              "You are a cybersecurity expert specializing in URL and phishing analysis. " +
              "Analyze the given URL for potential security threats, including phishing, malware, scams, or suspicious patterns. " +
              "Consider domain reputation, suspicious URL patterns, redirect chains, and content indicators."
          },
          {
            role: "user",
            content: contentToAnalyze
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });

      const result = JSON.parse(response.choices[0].message.content);
      return {
        isMalicious: result.isMalicious || false,
        confidence: result.confidence || 0.5,
        threatType: result.threatType || null,
        explanation: result.explanation || "No explanation provided"
      };
    } catch (error) {
      log(`Error analyzing URL with AI: ${error}`, "ai-service");
      // Fallback to a safe default
      return {
        isMalicious: false,
        confidence: 0.5,
        threatType: null,
        explanation: "Unable to analyze URL due to an error"
      };
    }
  }

  /**
   * Analyzes a file for potential threats using AI
   * @param fileBuffer Buffer containing the file data
   * @param fileName Name of the file
   * @param mimeType MIME type of the file
   */
  async analyzeFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<{
    isMalicious: boolean;
    confidence: number;
    threatType: string | null;
    explanation: string;
  }> {
    try {
      log(`Analyzing file with AI: ${fileName}`, "ai-service");
      
      // For text-based files, we can analyze the content directly
      const isTextFile = mimeType.includes('text/') || 
                          mimeType.includes('application/json') ||
                          mimeType.includes('application/xml') ||
                          mimeType.includes('application/javascript');
      
      if (isTextFile) {
        const fileContent = fileBuffer.toString('utf-8');
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: 
                "You are a cybersecurity expert specializing in file analysis. " +
                "Analyze the given file content for potential security threats, including malicious code, scripts, exploits, or suspicious patterns."
            },
            {
              role: "user",
              content: `File name: ${fileName}\nMIME type: ${mimeType}\n\nContent: ${fileContent.substring(0, 10000)}`  // Limit content size
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        });

        const result = JSON.parse(response.choices[0].message.content);
        return {
          isMalicious: result.isMalicious || false,
          confidence: result.confidence || 0.5,
          threatType: result.threatType || null,
          explanation: result.explanation || "No explanation provided"
        };
      }
      
      // For non-text files or large files, return a default response
      // In a real implementation, we would use specialized file analysis tools
      return {
        isMalicious: false,
        confidence: 0.5,
        threatType: null,
        explanation: "Non-text file analysis is not directly supported by AI text models"
      };
    } catch (error) {
      log(`Error analyzing file with AI: ${error}`, "ai-service");
      return {
        isMalicious: false,
        confidence: 0.5,
        threatType: null,
        explanation: "Unable to analyze file due to an error"
      };
    }
  }

  /**
   * Analyzes an image for steganography and other suspicious content
   * @param imageBuffer Buffer containing the image data
   * @param imageName Name of the image file
   */
  async analyzeImage(imageBuffer: Buffer, imageName: string): Promise<{
    isSuspicious: boolean;
    confidence: number;
    threatType: string | null;
    explanation: string;
  }> {
    try {
      log(`Analyzing image with AI: ${imageName}`, "ai-service");
      
      // Convert the image buffer to base64
      const base64Image = imageBuffer.toString('base64');
      
      // Using Anthropic's Claude for image analysis
      const response = await anthropic.messages.create({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 1024,
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image for potentially hidden information (steganography), visual manipulation, or suspicious elements. Look for unusual patterns, artifacts, or other signs of hidden data. Provide a detailed assessment."
            },
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg", // Assume jpeg for simplicity, should be dynamic in production
                data: base64Image
              }
            }
          ]
        }]
      });

      // Extract the text response
      const analysisText = response.content[0].text;
      
      // Determine if the image is suspicious based on the analysis
      const isSuspicious = 
        analysisText.toLowerCase().includes("steganography") ||
        analysisText.toLowerCase().includes("hidden") ||
        analysisText.toLowerCase().includes("suspicious") ||
        analysisText.toLowerCase().includes("artifact") ||
        analysisText.toLowerCase().includes("encoded");
      
      // Calculate a basic confidence score
      const confidence = isSuspicious ? 0.7 : 0.3;
      
      // Determine the threat type
      let threatType = null;
      if (isSuspicious) {
        if (analysisText.toLowerCase().includes("steganography")) {
          threatType = "steganography";
        } else if (analysisText.toLowerCase().includes("manipulated")) {
          threatType = "manipulation";
        } else {
          threatType = "suspicious_content";
        }
      }

      return {
        isSuspicious,
        confidence,
        threatType,
        explanation: analysisText.substring(0, 500) // Limit explanation length
      };
    } catch (error) {
      log(`Error analyzing image with AI: ${error}`, "ai-service");
      return {
        isSuspicious: false,
        confidence: 0.5,
        threatType: null,
        explanation: "Unable to analyze image due to an error"
      };
    }
  }
}

// Export an instance for use across the application
export const aiService = new AIService();
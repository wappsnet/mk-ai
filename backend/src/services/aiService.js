const axios = require('axios');
const OpenAI = require('openai');

class AIService {
  /**
   * Send a prompt to an AI provider and get a response
   * @param {Object} provider - The AI provider configuration
   * @param {string} prompt - The prompt to send
   * @returns {Promise<{response: string, time: number}>}
   */
  static async sendPrompt(provider, prompt) {
    const startTime = Date.now();

    try {
      let response;

      switch (provider.provider_type.toLowerCase()) {
        case 'openai':
          response = await this.sendToOpenAI(provider, prompt);
          break;
        case 'anthropic':
          response = await this.sendToAnthropic(provider, prompt);
          break;
        case 'custom':
          response = await this.sendToCustomAPI(provider, prompt);
          break;
        default:
          throw new Error(`Unsupported provider type: ${provider.provider_type}`);
      }

      const responseTime = Date.now() - startTime;

      return {
        response,
        time: responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      throw {
        message: error.message,
        time: responseTime
      };
    }
  }

  /**
   * Send prompt to OpenAI
   */
  static async sendToOpenAI(provider, prompt) {
    const openai = new OpenAI({
      apiKey: provider.api_key,
      baseURL: provider.base_url || undefined
    });

    const completion = await openai.chat.completions.create({
      model: provider.model || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    return completion.choices[0].message.content;
  }

  /**
   * Send prompt to Anthropic Claude
   */
  static async sendToAnthropic(provider, prompt) {
    const response = await axios.post(
      provider.base_url || 'https://api.anthropic.com/v1/messages',
      {
        model: provider.model || 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'x-api-key': provider.api_key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    return response.data.content[0].text;
  }

  /**
   * Send prompt to a custom API endpoint
   */
  static async sendToCustomAPI(provider, prompt) {
    const response = await axios.post(
      provider.base_url,
      {
        prompt: prompt,
        model: provider.model
      },
      {
        headers: {
          'Authorization': `Bearer ${provider.api_key}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Assuming the custom API returns a response in { response: "..." } format
    return response.data.response || response.data.text || response.data.content;
  }

  /**
   * Create a verification prompt for analyzing multiple AI responses
   */
  static createVerificationPrompt(userPrompt, responses) {
    const responsesText = responses
      .map((r, i) => `Response ${i + 1} (from ${r.provider.name}):\n${r.text}\n`)
      .join('\n');

    return `You are an AI response verifier. A user asked the following question:

"${userPrompt}"

Multiple AI systems provided the following responses:

${responsesText}

Please analyze these responses and provide:
1. A comprehensive summary combining the best insights from all responses
2. Identify which response is the most accurate, helpful, and complete
3. Explain your reasoning for choosing that response

Format your response as JSON:
{
  "summary": "Your comprehensive summary here",
  "best_response_index": 0,
  "reasoning": "Your detailed reasoning here"
}`;
  }

  /**
   * Verify responses using the verifier AI
   */
  static async verifyResponses(verifierProvider, userPrompt, responses) {
    const verificationPrompt = this.createVerificationPrompt(userPrompt, responses);
    const result = await this.sendPrompt(verifierProvider, verificationPrompt);

    try {
      // Try to parse JSON response
      const parsed = JSON.parse(result.response);
      return {
        summary: parsed.summary,
        bestResponseIndex: parsed.best_response_index,
        reasoning: parsed.reasoning
      };
    } catch (error) {
      // If JSON parsing fails, try to extract information from text
      return {
        summary: result.response,
        bestResponseIndex: 0,
        reasoning: 'Unable to parse structured response'
      };
    }
  }
}

module.exports = AIService;

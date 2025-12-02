const Chat = require('../models/chat');
const Message = require('../models/message');
const AIProvider = require('../models/aiProvider');
const AIResponse = require('../models/aiResponse');
const Verification = require('../models/verification');
const AIService = require('../services/aiService');

class ChatController {
  static async create(req, res) {
    try {
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const id = await Chat.create(title);

      res.status(201).json({
        id,
        message: 'Chat created successfully'
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const chats = await Chat.getAll();
      res.json(chats);
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const chat = await Chat.getById(id);

      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      res.json(chat);
    } catch (error) {
      console.error('Error fetching chat:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getMessages(req, res) {
    try {
      const { id } = req.params;
      const messages = await Chat.getMessagesWithResponses(id);

      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async sendMessage(req, res) {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({ error: 'Message content is required' });
      }

      // Verify chat exists
      const chat = await Chat.getById(id);
      if (!chat) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      // Create message
      const messageId = await Message.create(id, content, 'user');

      // Get all active AI providers
      const providers = await AIProvider.getActive();

      if (providers.length === 0) {
        return res.status(400).json({
          error: 'No active AI providers configured'
        });
      }

      // Send the message to all providers in parallel
      const responsePromises = providers
        .filter(p => !p.is_verifier) // Exclude verifier from initial responses
        .map(async (provider) => {
          try {
            const result = await AIService.sendPrompt(provider, content);

            // Save successful response
            const responseId = await AIResponse.create(
              messageId,
              provider.id,
              result.response,
              result.time,
              'success'
            );

            return {
              id: responseId,
              provider_id: provider.id,
              provider_name: provider.name,
              text: result.response,
              time: result.time,
              status: 'success'
            };
          } catch (error) {
            // Save error response
            const responseId = await AIResponse.create(
              messageId,
              provider.id,
              null,
              error.time || 0,
              'error',
              error.message
            );

            return {
              id: responseId,
              provider_id: provider.id,
              provider_name: provider.name,
              error: error.message,
              time: error.time || 0,
              status: 'error'
            };
          }
        });

      const responses = await Promise.all(responsePromises);

      // Get successful responses for verification
      const successfulResponses = responses.filter(r => r.status === 'success');

      let verification = null;

      if (successfulResponses.length > 0) {
        // Get verifier AI
        const verifierProvider = await AIProvider.getVerifier();

        if (verifierProvider) {
          try {
            const verificationResult = await AIService.verifyResponses(
              verifierProvider,
              content,
              successfulResponses.map(r => ({
                text: r.text,
                provider: { name: r.provider_name }
              }))
            );

            // Save verification
            const bestResponse = successfulResponses[verificationResult.bestResponseIndex];

            await Verification.create(
              messageId,
              verifierProvider.id,
              verificationResult.summary,
              bestResponse.id,
              verificationResult.reasoning
            );

            verification = {
              summary: verificationResult.summary,
              best_response_id: bestResponse.id,
              reasoning: verificationResult.reasoning
            };
          } catch (error) {
            console.error('Error during verification:', error);
          }
        }
      }

      res.json({
        message_id: messageId,
        responses,
        verification
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const affectedRows = await Chat.update(id, title);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      res.json({ message: 'Chat updated successfully' });
    } catch (error) {
      console.error('Error updating chat:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await Chat.delete(id);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Chat not found' });
      }

      res.json({ message: 'Chat deleted successfully' });
    } catch (error) {
      console.error('Error deleting chat:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ChatController;

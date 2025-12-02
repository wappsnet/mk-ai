const AIProvider = require('../models/aiProvider');

class AIProviderController {
  static async create(req, res) {
    try {
      const { name, provider_type, api_key, model, base_url, is_verifier } = req.body;

      if (!name || !provider_type || !api_key) {
        return res.status(400).json({
          error: 'Name, provider_type, and api_key are required'
        });
      }

      const id = await AIProvider.create({
        user_id: req.user.id,
        name,
        provider_type,
        api_key,
        model,
        base_url,
        is_verifier
      });

      res.status(201).json({
        id,
        message: 'AI provider created successfully'
      });
    } catch (error) {
      console.error('Error creating AI provider:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getAll(req, res) {
    try {
      const providers = await AIProvider.getAllByUserId(req.user.id);

      // Hide API keys in the response
      const sanitizedProviders = providers.map(p => ({
        ...p,
        api_key: p.api_key ? '***' : null
      }));

      res.json(sanitizedProviders);
    } catch (error) {
      console.error('Error fetching AI providers:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async getActive(req, res) {
    try {
      const providers = await AIProvider.getActiveByUserId(req.user.id);

      // Hide API keys in the response
      const sanitizedProviders = providers.map(p => ({
        ...p,
        api_key: p.api_key ? '***' : null
      }));

      res.json(sanitizedProviders);
    } catch (error) {
      console.error('Error fetching active AI providers:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const affectedRows = await AIProvider.update(id, req.user.id, updates);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'AI provider not found' });
      }

      res.json({ message: 'AI provider updated successfully' });
    } catch (error) {
      console.error('Error updating AI provider:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await AIProvider.delete(id, req.user.id);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'AI provider not found' });
      }

      res.json({ message: 'AI provider deleted successfully' });
    } catch (error) {
      console.error('Error deleting AI provider:', error);
      res.status(500).json({ error: error.message });
    }
  }

  static async setActive(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      const affectedRows = await AIProvider.setActive(id, req.user.id, is_active);

      if (affectedRows === 0) {
        return res.status(404).json({ error: 'AI provider not found' });
      }

      res.json({ message: 'AI provider status updated successfully' });
    } catch (error) {
      console.error('Error updating AI provider status:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AIProviderController;

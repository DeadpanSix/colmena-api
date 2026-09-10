const dashboardService = require('../services/dashboard.service');

async function getSummary(req, res) {
  try {
    const summary = await dashboardService.getSummary();
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Unexpected error fetching dashboard summary:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTeamDashboard(req, res) {
  const teamId = Number(req.params.teamId);

  if (Number.isNaN(teamId)) {
    return res.status(400).json({ error: 'Invalid team id' });
  }

  if (req.user.role !== 'ADMIN' && req.user.teamId !== teamId) {
    return res.status(403).json({ error: 'You can only view your own team dashboard' });
  }

  try {
    const dashboard = await dashboardService.getTeamDashboard(teamId);
    return res.status(200).json(dashboard);
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

module.exports = { getSummary, getTeamDashboard };

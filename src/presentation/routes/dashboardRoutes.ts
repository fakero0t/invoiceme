import { Router } from 'express';
import { DependencyContainer } from 'tsyringe';
import { GetDashboardStatisticsQueryHandler } from '../../application/queries/dashboard/GetDashboardStatistics/GetDashboardStatisticsQueryHandler';

export function createDashboardRoutes(container: DependencyContainer): Router {
  const router = Router();

  // GET /statistics - Get dashboard statistics
  router.get('/statistics', async (req, res, next): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required'
          }
        });
        return;
      }

      const handler = container.resolve(GetDashboardStatisticsQueryHandler);
      const stats = await handler.handle({
        userId: req.user.id,
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}


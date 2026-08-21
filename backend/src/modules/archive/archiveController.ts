import { Request, Response, NextFunction } from 'express';
import * as archiveService from './archiveService';

export const archiveOldOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await archiveService.archiveOldOrders();
    res.status(200).json({ data: { archivedCount: count }, message: 'Orders archived successfully' });
  } catch (error) {
    next(error);
  }
};

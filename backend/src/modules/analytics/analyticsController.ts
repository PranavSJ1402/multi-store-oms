import { Request, Response, NextFunction } from 'express';
import * as analyticsService from './analyticsService';

export const getOrdersPerDay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getOrdersPerDay();
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getRevenuePerStore = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getRevenuePerStore();
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

export const getTopItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await analyticsService.getTopItems();
    res.status(200).json({ data });
  } catch (error) {
    next(error);
  }
};

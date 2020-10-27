import { Router } from 'express';

export const message = Router();

message.post('/message', async (req, res, next) => {
  try {
    res.status(201).json({});
  } catch (e) {
    next(e);
  }
});

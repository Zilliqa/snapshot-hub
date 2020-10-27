import { Router } from 'express';

export const message = Router();

message.post('/message', async (req, res, next) => {
  const body = req.body;
  const msg = JSON.parse(body.msg);

  try {
    res.status(201).json({});
  } catch (e) {
    next(e);
  }
});

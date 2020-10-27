import { Router } from 'express';

export const spaces = Router();

spaces.post('/spaces', async (req, res, next) => {
  try {
    res.status(201).json({});
  } catch (e) {
    next(e);
  }
});

spaces.get('/spaces/:key?', (req, res) => {
  const { key } = req.params;
  return  res.status(201).json({
    key
  });
});

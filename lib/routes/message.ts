import { Router } from 'express';

export const message = Router();

message.post('/message', async (req, res) => {
  const body = req.body;
  const msg = JSON.parse(body.msg);

  res.status(201).json({
    msg
  });
});

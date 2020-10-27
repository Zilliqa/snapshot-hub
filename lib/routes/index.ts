import { Router } from 'express';

import { message } from './message';
import { spaces } from './spaces';

const router = Router();

router.use('/message', message);
router.use('/spaces', spaces);

export default router;

import { getResult } from '../controllers/ai.controller.js';
import {Router} from 'express'
const router = Router();

router.get('/get-result', getResult)

export default router;
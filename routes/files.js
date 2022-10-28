import express from 'express'
import { createFile, downlaodFile, emailSend, getFile } from '../controllers/fileController.js'

const router = express.Router()

router.post('/', createFile)
router.get('/:uuid', getFile)
router.get('/download/:uuid', downlaodFile)
router.post('/send', emailSend)

export default router
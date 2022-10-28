import multer from 'multer'
import path from 'path'
import { v4 as uuid4 } from 'uuid'
import { createError } from '../error.js'
import FileModel from '../models/file.model.js'
import { sendMail } from '../services/email.service.js'
import { emailTamplate } from '../services/email.tamplate.js'

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})

let uplaod = multer({
    storage,
    limits: { fileSize: 1000000 * 100 },
}).single('myfile')

export const createFile = async (req, res, next) => {
    try {
        uplaod(req, res, async (err) => {
            if (!req.file) {
                return next(createError(400, "file is missing"))
            }
            if (err) {
                return next(createError(400, err.message))
            }
            const file = await FileModel.create({
                filename: req.file.filename,
                uuid: uuid4(),
                path: req.file.path,
                size: req.file.size
            })

            return res.status(201).json({
                file: `${process.env.APP_BASE_URL}/files/${file.uuid}`
            })
        })
    } catch (err) {
        next(err)
    }
}

export const getFile = async (req, res, next) => {
    try {
        const { uuid } = req.params
        if (!uuid) {
            return next(createError(400, "id is missing"))
        }
        const file = await FileModel.findOne({ uuid: uuid })

        if (!file) {
            return next(createError(404, "file not found"))
        }

        const response = {
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/downlaod/${file.uuid}`
        }
        res.status(200).json({
            data: response
        })
    } catch (err) {
        next(err)
    }
}

export const downlaodFile = async (req, res, next) => {
    try {
        const { uuid } = req.params
        if (!uuid) {
            return next(createError(400, "id is missing"))
        }
        const file = await FileModel.findOne({ uuid: uuid })

        if (!file) {
            return next(createError(404, "file not found"))
        }

        const filePath = file.path

        res.status(200).download(filePath)
    } catch (err) {
        next(err)
    }
}

export const emailSend = async (req, res, next) => {
    try {
        const { uuid, emailTo, emailFrom } = req.body

        if (!uuid || !emailTo || !emailFrom) {
            return next(createError(422, "All fields are required"))
        }
        const file = await FileModel.findOne({ uuid: uuid })

        if (!file) {
            return next(createError(404, "file not found"))
        }

        if (file.sender) {
            return next(createError(404, "email already send"))
        }

        file.sender = emailTo
        file.receiver = emailFrom

        const response = await file.save()

        sendMail({
            from: emailTo,
            to: emailFrom,
            subject: "file sharing email",
            text: `${emailFrom} shared a file with you`,
            html: emailTamplate({
                emailFrom: emailFrom,
                downloadLink: `${process.env.APP_BASE_URL}/files/downlaod/${file.uuid}`,
                size: parseInt(file.size / 1000) + 'KB',
                expires: '24 hours'
            })
        })

        res.status(200).json({
            msg: "email send successfully"
        })

    } catch (err) {
        next(err)
    }
}
// Imports needed stuff.
import * as express from "express"
import * as uploadersCore from "./uploaders"
import { ConfigHandler } from "./config"
// @ts-ignore
import * as fileUpload from "express-fileupload"

// Defines the express app.
const app = express()

// Uses file uploads.
app.use(fileUpload())

// Gets the username/password if they are set.
const username = process.env.MAGICCAP_USERNAME
const password = process.env.MAGICCAP_PASSWORD

// Handles sending proxy information.
app.get("/", (_, res) => {
    const supportedUploaders: any = {}
    for (const key of Object.keys(uploadersCore.uploaders)) {
        supportedUploaders[key] = {
            options: (uploadersCore.uploaders as any)[key].config_options,
            name: (uploadersCore.uploaders as any)[key].name,
        }
    }
    res.json({
        protected: username !== undefined,
        "supported_uploaders": supportedUploaders,
    })
})

// Handles actual uploads.
app.post("/upload/:uploader", async(req, res) => { 
    // @ts-ignore
    const files = req.files

    if (username) {
        const authHeader = req.headers.authorization
        const unauthorized = {
            success: false,
            config: null,
            message: "Unauthorized",
        }

        if (!authHeader) {
            res.json(unauthorized)
            res.status(403)
            return
        }

        const authHeaderSplit = (authHeader as string).split(" ")
        if (authHeaderSplit.length === 1 || authHeaderSplit[0] !== "MagicCap-JSON-Auth") {
            res.json(unauthorized)
            res.status(403)
            return
        }

        authHeaderSplit.shift()
        const secondPart = authHeaderSplit.join(" ")
        let jsonParsed
        try {
            jsonParsed = JSON.parse(secondPart)
        } catch (_) {
            res.json(unauthorized)
            res.status(403)
            return
        }

        if (typeof jsonParsed !== "object") {
            res.json(unauthorized)
            res.status(403)
            return
        }

        const claimedUsername = jsonParsed.username
        const claimedPassword = jsonParsed.password
        if (username !== claimedUsername || password !== claimedPassword) {
            res.json(unauthorized)
            res.status(403)
            return
        }
    }

    const config = req.headers.config
    let parsedConfig
    if (!config) {
        res.json({
            success: false,
            config: null,
            message: "No config given",
        })
        res.status(400)
        return
    }
    try {
        parsedConfig = JSON.parse(config as string)
        if (typeof parsedConfig !== "object") {
            throw new Error()
        }
    } catch (_) {
        res.json({
            success: false,
            config: null,
            message: "Invalid config given",
        })
        res.status(400)
        return
    }
    parsedConfig = new ConfigHandler(parsedConfig)

    if (!files || !files.f) {
        res.json({
            success: false,
            config: null,
            message: "No files found",
        })
        res.status(400)
        return
    }
    const fileInfo = files.f
    const file = fileInfo.data
    const filename = fileInfo.name
    const ext = filename.split(".").pop()

    const uploaderName = req.params.uploader
    const uploader = (uploadersCore.uploaders as any)[uploaderName]
    if (!uploader) {
        res.json({
            success: false,
            config: parsedConfig.o,
            message: "Uploader does not exist",
        })
        res.status(400)
        return
    }

    let url
    try {
        url = await uploader.upload(parsedConfig, file, ext, filename)
    } catch (e) {
        res.json({
            success: false,
            config: parsedConfig.o,
            message: e.toString(),
        })
        res.status(400)
        return
    }

    res.json({
        success: true,
        config: parsedConfig.o,
        url,
    })
})

// Sets the host.
const host = process.env.MAGICCAP_HOST ? process.env.MAGICCAP_HOST : "127.0.0.1"

// Starts listening on port 8080.
app.listen(8080, host, () => console.log(`Listening on ${host}:8080`))

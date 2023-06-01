import { format } from 'date-fns'
import { v4 as uuid } from 'uuid'
import fs from 'fs'
import fsPromises from 'fs/promises'
import {dirname , join} from 'path'
import { fileURLToPath } from 'url'



const logEvents = async (message, logFileName) => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)

    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        if (!fs.existsSync(join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(join(__dirname, '..', 'logs'))
        }
        await fsPromises.appendFile(
            join(__dirname, '..', 'logs', `${logFileName}`),
            logItem
        )
        
    } catch (error) {
        console.log(error)
    }
}


const logger = (req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    next()
}

export { logger, logEvents }
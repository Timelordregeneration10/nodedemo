const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const port = 3000
var bodyParser = require('body-parser')
const { default: axios } = require('axios')
const crypto = require('crypto');

const calcMD5 = (str) => {
    return crypto.createHash('md5').update(str).digest('hex');
}

const saveImage=(data, fileName)=>{
    // resolve函数拼接出绝对路径，__dirname为当前文件所在目录
    const outputDirectory = path.resolve(__dirname, 'output');
    if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory);
    }
    const outputfilePath = path.resolve(outputDirectory, fileName);
    if(fs.existsSync(outputfilePath)){
        console.log(`file${fileName} already exists`);
        return;
    }
    fs.writeFileSync(outputfilePath, data);
}

const createErrorResponse=(message)=>{
    return JSON.stringify({
        success: false,
        message,
    })
}

// parse application/json
app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.send('rmt!')
})

app.post('/uploadImage', async (req, res) => {
    const { url } = req.body;
    res.setHeader('Content-Type', 'application/json');
    if (!url) {
        res.status(400).send(createErrorResponse('url required!'));
    }
    else {
        try {
            const urlObj = new URL(url);
            try {
                const image = await axios.get(url,{
                    responseType: 'arraybuffer'
                });
                // console.log(image.data);
                const md5 = calcMD5(image.data);
                // console.log(md5);
                const ext =url.split('?')[0].split('.').pop();
                const fileName = `${md5}.${ext}`;
                // console.log(fileName);
                saveImage(image.data, fileName);
                res.end(JSON.stringify({
                    success: true,
                    data:{
                        md5,
                        fileName,
                    }
                }));
            } catch {
                res.status(500).send(createErrorResponse(`cannot download image from ${url}!`))
            }
        } catch {
            res.status(400).send(createErrorResponse('Invalid url!'));
        }
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
const fs = require('fs')
const path = require('path')
const mime = require('mime')
const express = require('express')
const exphbs  = require('express-handlebars')
const filenamify = require('filenamify')
const bodyParser = require('body-parser')

var app = express()

const dirRoot = './test/'

const getDir = (dir) => {
	return fs.readdirSync(`${dirRoot}${dir}`)
}

const getDirFiles = (dir) => {
	var data = {
		files: [],
		dir: []
	}
	for (file of getDir(dir)) {
		if (fs.statSync(`${dirRoot}${dir}${file}`).isDirectory()) {
			data.dir.push(`${dir}${file}`)
		} else {
			data.files.push(`${dir}${file}`)
		}
	}
	data.files.sort()
	data.dir.sort()
	return data
}

const optionsSend = (file) => {
	return {
		root:  __dirname + '/test/',
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'Content-disposition': `attachment; filename=${
				filenamify(path.basename(file), {replacement: '-'})
			}`,
			'Content-type': mime.getType(path.basename(file))
		}
	}
}

app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('port', process.env.PORT || 3000)
app.set('view engine', 'handlebars')
//app.enable('view cache')

app.use('/uikit', express.static(`${__dirname}/node_modules/uikit/dist/`))
app.use('/css', express.static(`${__dirname}/css/`))
app.use('/static', express.static(dirRoot))
app.use(bodyParser.json())

app.get('/close', (req, res) => {
	//TODO
	return res.render('files')
})

app.get('/singout', (req, res) => {
	//TODO
	return res.render('files')
})

app.get(['/files/:dir', '/', '/files'], (req, res) => {
	console.log(req.params.dir)
	return res.render('files')
})

app.post('/download', (req, res) => {
	var file = req.body.file
	return res.sendFile(file, optionsSend(file), (err) => {
		if (err) {
			console.log(err)
		} else {
			console.log('Sent!')
		}
	})
})

app.listen(app.get('port'), () => {
	console.log(`Open in you browser: http://localhost:${app.get('port')} or YOU_IP:${app.get('port')}`)
})

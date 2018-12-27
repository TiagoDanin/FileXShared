const fs = require('fs')
const path = require('path')
const mime = require('mime')
const express = require('express')
const exphbs  = require('express-handlebars')
const filenamify = require('filenamify')
const bodyParser = require('body-parser')

var app = express()

const dirRoot = './test/'
var lastFolders = []

const getDir = (dir) => {
	if (fs.existsSync(`${dirRoot}${dir}`)) {
		return fs.readdirSync(`${dirRoot}${dir}`)
	}
	return []
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

	if (data.files.length <= 0 && data.dir.length <= 0) {
		return false
	}

	data.files = data.files.map((name) => {
		var f = {}
		f.name = name != '' ? name.replace(dir, '') : name
		f.type = mime.getType(path.basename(name))
		f.video = f.type.startsWith('video/') ? {file: name, type: f.type} : false
		f.audio = f.type.startsWith('audio/') ? {file: name, type: f.type} : false
		f.image = f.type.startsWith('image/') ? name : false
		return f
	})
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
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/close', async (req, res) => {
	res.render('alert', {
		lastFolders: lastFolders,
		text: 'Shutdown Server...'
	})
	await new Promise((resolve) => setTimeout(
		resolve,
		(5000) //5s
	))
	return process.exit()
})

app.get('/singout', (req, res) => {
	//TODO
	return res.render('alert', {
		lastFolders: lastFolders,
		text: 'Sing Out and removing password of FileXShared.'
	})
})

app.get(['/', '/files/:dir', '/files/*', '/files', '/download'], (req, res) => {
	var dir = ''
	if (req.params.dir) {
		dir = `${req.params.dir}/`
	} else if (req.originalUrl.startsWith('/files/')) {
		dir = `${req.originalUrl.replace('/files/', '')}/`
	}

	if (dir != '') {
		if (lastFolders.length >= 3) {
			lastFolders = [...lastFolders.splice(1, 3), dir.replace()]
		} else {
			lastFolders.push(dir.replace())
		}
	}

	console.log(req.originalUrl)
	var data = getDirFiles(dir)
	if (!data) {
		return res.render('alert', {
			lastFolders: lastFolders,
			text: 'No has files or folders!.'
		})
	}

	return res.render('files', {
		upload: true,
		lastFolders: lastFolders,
		...data
	})
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

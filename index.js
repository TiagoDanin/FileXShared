const fs = require('fs')
const path = require('path')
const mime = require('mime')
const express = require('express')
const exphbs  = require('express-handlebars')
const cookieSession = require('cookie-session')
const filenamify = require('filenamify')
const bodyParser = require('body-parser')
const multer = require('multer')

const dirRoot = './test/'
const password = '12345'
var lastFolders = []

const clearNameFile = (name) => {
	return filenamify(path.basename(name), {replacement: '-'})
}

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
		f.file = name
		f.type = mime.getType(path.basename(name)) || 'none'
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
			'Content-disposition': `attachment; filename=${clearNameFile(file)}`,
			'Content-type': mime.getType(path.basename(file)) || ''
		}
	}
}

const checkPassword = (req, res) => {
	const passwordInput = req.session.password
	if (passwordInput != password) {
		res.redirect('/login')
		return false
	}
	return true
}

const app = express()
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `${dirRoot}uploads/`)
	},
	filename: (req, file, cb) => {
		cb(null, `${clearNameFile(file.originalname)}`)
	}
})
const upload = multer({ storage: storage })

app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('port', process.env.PORT || 3000)
app.set('view engine', 'handlebars')
app.set('trust proxy', 1)
app.use(cookieSession({
	name: 'session',
	keys: ['FileXShared', 'filexshared']
}))
//app.enable('view cache')

app.use((req, res, next) => {
	if (
		req.path != '/login' &&
		!(req.path.startsWith('/css') || req.path.startsWith('/uikit')) &&
		!checkPassword(req, res)
	) {
		console.log('[!] Open page of login')
		return res.redirect('/login')
	}
	return next()
})
app.use('/uikit', express.static(`${__dirname}/node_modules/uikit/dist/`))
app.use('/css', express.static(`${__dirname}/css/`))
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/static', express.static(dirRoot))

app.get(['/about', '/faq', '/help'], async (req, res) => {
	console.log('[!] Open help')
	return res.render('help', {
		lastFolders: req.session.lastFolders,
		list: [{
			title: 'Enable Upload',
			tags: ['Server', 'Client'],
			text: 'Create a folder with the name "uploads". (Need reload server)'
		}, {
			title: 'Enable Password',
			tags: ['Server'],
			text: 'Start with the command "filexshared --password=012345"'
		}, {
			title: 'Disable Option "Close Server"',
			tags: ['Server'],
			text: 'Start with the command "filexshared --close=false"'
		}, {
			title: 'Sign Out',
			tags: ['Client'],
			text: 'Delete password of browser (Salved with cookies)'
		}, {
			title: 'About',
			tags: ['Info'],
			text: 'FileXShared is developed by Tiago Danin (https://tiagodanin.github.io)'
		}, {
			title: 'Framework info',
			tags: ['Info'],
			text: 'FileXShared use Express, Handlebars, UiKit...'
		}]
	})
})

app.get('/close', async (req, res) => {
	console.log('[!] Shutdown Server...')
	res.render('alert', {
		lastFolders: req.session.lastFolders,
		text: 'Shutdown Server...'
	})
	await new Promise((resolve) => setTimeout(
		resolve,
		(5000) //5s
	))
	return process.exit()
})

app.get('/login', (req, res) => {
	console.log('[!] Login user')
	return res.render('login', {
		lastFolders: req.session.lastFolders
	})
})

app.get('/singout', (req, res) => {
	console.log('[!] Sing out user')
	req.session.password = ''
	return res.render('singout', {
		lastFolders: req.session.lastFolders,
		text: 'Sing Out and removing password of browser.'
	})
})

app.get(['/', '/files/:dir', '/files/*', '/files', '/download'], (req, res) => {
	var dir = ''
	if (req.params.dir) {
		dir = `${req.params.dir}/`
	} else if (req.originalUrl.startsWith('/files/')) {
		dir = `${req.originalUrl.replace('/files/', '')}/`
	}
	dir = decodeURIComponent(dir)
	console.log(`[!] Open Folder: ${dir}`)

	if (dir != '') {
		if (lastFolders.length <= 0) {
			lastFolders = req.session.lastFolders || []
		}
		if (lastFolders.length >= 3) {
			lastFolders = [...lastFolders.splice(1, 3), dir.replace()]
		} else {
			lastFolders.push(dir.replace())
		}
		req.session.lastFolders = lastFolders
	}
	var data = getDirFiles(dir)
	if (!data) {
		return res.render('alert', {
			lastFolders: req.session.lastFolders,
			text: 'No has files or folders!.'
		})
	}

	return res.render('files', {
		upload: true,
		lastFolders: req.session.lastFolders,
		...data
	})
})

app.post('/login', (req, res) => {
	const passwordInput = req.body.password || ''
	req.session.password = passwordInput
	if (checkPassword(req, res)) {
		return res.redirect('/files')
	}
	return res.redirect('/login')
})

app.post('/download', (req, res) => {
	const file = req.body.file
	if (!file) {
		return res.send("Falid!")
	}
	return res.sendFile(file, optionsSend(file), (err) => {
		if (err) {
			console.log(`[-] Error: ${err}`)
		} else {
			console.log(`[+] Send file: ${file}`)
		}
	})
})

app.post('/upload', upload.any(), (req, res) => {
	req.files.map((e) => {
		console.log(`[+] Receive: ${e.originalname}`)
	})
	return res.send('Done!')
})

app.listen(app.get('port'), () => {
	console.log(`[!] Open browser: http://localhost:${app.get('port')} or YOU_IP:${app.get('port')}`)
	console.log('[!] Help in http://URL_FILEXSHARED/help')
})

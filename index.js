#!/usr/bin/env node

const fs = require('fs')
const path = require('path').posix
const argv = require('minimist')(process.argv)
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')
const exphbs = require('express-handlebars')
const express = require('express')
const filenamify = require('filenamify')
const hubdown = require('hubdown')
const mime = require('mime')
const multer = require('multer')
const pathExists = require('path-exists').sync
const download = require('download')
const filenamifyUrl = require('filenamify-url')

const dirRoot = process.cwd()
const password = argv.password || ''
const enableClose = !(argv['disable-close'] || false)
const uploadPath = path.join(dirRoot, 'uploads')
const enableUpload = pathExists(uploadPath)
const port = argv.port || process.env.PORT || process.env.port || 3000
const dark = argv.dark || false
let lastFolders = []

const clearNameFile = name => {
	return filenamify(path.basename(name), {
		replacement: '-'
	})
}

const getDir = dir => {
	if (pathExists(path.join(dirRoot, dir))) {
		return fs.readdirSync(path.join(dirRoot, dir))
	}

	return []
}

const loadFile = file => {
	if (pathExists(file)) {
		return fs.readFileSync(file).toString()
	}

	return false
}

const markdwonToHtml = async file => {
	if (pathExists(file)) {
		const content = await hubdown(
			fs.readFileSync(file).toString()
		).then(res => res.content).catch(() => false)

		return content
	}

	return false
}

const getDirFiles = async dir => {
	const data = {
		files: [],
		dir: []
	}
	const dirs = getDir(dir)

	dirs.map(file => {
		if (fs.statSync(path.join(dirRoot, dir, file)).isDirectory()) {
			data.dir.push(path.join(dir, file))
		} else {
			data.files.push(path.join(dir, file))
		}
	})
	data.files.sort()
	data.dir.sort()

	if (data.files.length <= 0 && data.dir.length <= 0) {
		return false
	}

	data.files = await Promise.all(data.files.map(async name => {
		const f = {}
		f.name = name === '' ? name : name.replace(dir, '')
		f.file = name
		f.type = mime.getType(path.basename(name)) || 'none'
		f.video = f.type.startsWith('video/') ? {
			file: name,
			type: f.type
		} : false
		f.audio = f.type.startsWith('audio/') ? {
			file: name,
			type: f.type
		} : false
		f.image = f.type.startsWith('image/') ? name : false
		f.markdown = f.type == 'text/markdown' ? await markdwonToHtml(f.name) : false
		f.text = (f.type.startsWith('text/') && f.type != 'text/markdown') ? loadFile(f.name) : false
		return f
	}))

	return data
}

const optionsSend = file => {
	return {
		root: dirRoot,
		dotfiles: 'deny',
		headers: {
			'x-timestamp': Date.now(),
			'Content-disposition': `attachment; filename=${clearNameFile(file)}`,
			'Content-type': mime.getType(path.basename(file)) || ''
		}
	}
}

const checkPassword = (req, res) => {
	if (password == '') {
		return true
	}

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
		cb(null, uploadPath)
	},
	filename: (req, file, cb) => {
		cb(null, `${clearNameFile(file.originalname)}`)
	}
})
const upload = multer({
	storage
})

app.engine('handlebars', exphbs({
	defaultLayout: 'main',
	partialsDir: path.join(__dirname, 'views/partials'),
	layoutsDir: path.join(__dirname, 'views/layouts')
}))
app.set('port', port)
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'handlebars')
app.set('trust proxy', 1)

app.use(
	cookieSession({
		name: 'session',
		keys: ['FileXShared', 'filexshared']
	})
)
if (!argv.dev) {
	app.enable('view cache')
}

app.use((req, res, next) => {
	// Console.log(`[:]Path: ${req.path}`)
	if (
		req.path != '/login' &&
		!(req.path.startsWith('/css') || req.path.startsWith('/uikit')) &&
		!checkPassword(req, res)
	) {
		console.log('[!] Open page of login')
		return false
	}

	return next()
})

app.use('/uikit', express.static(path.join(path.dirname(require.resolve('uikit')), '..')))
app.use('/css', express.static(path.join(__dirname, 'css')))
app.use(bodyParser.urlencoded({
	extended: false
}))
app.use('/static', express.static(dirRoot))

app.get(['/about', '/faq', '/help'], async (req, res) => {
	console.log('[!] Open help')
	return res.render('help', {
		dark,
		lastFolders: req.session.lastFolders,
		enableUpload,
		enableClose,
		list: [{
			title: 'Enable Upload',
			tags: ['Server', 'Client'],
			text: 'Create a folder with the name "uploads". (Need reload server)'
		}, {
			title: 'Enable Dark Theme',
			tags: ['Server', 'Client'],
			text: 'Start with the command "filexshared --dark"'
		}, {
			title: 'Enable Password',
			tags: ['Server'],
			text: 'Start with the command "filexshared --password=012345"'
		}, {
			title: 'Disable Option "Close Server"',
			tags: ['Server'],
			text: 'Start with the command "filexshared --disable-close"'
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
	if (!enableClose) {
		return res.render('alert', {
			dark,
			lastFolders: req.session.lastFolders,
			enableUpload,
			enableClose,
			text: 'Disable!'
		})
	}

	console.log('[!] Shutdown Server...')
	res.render('alert', {
		dark,
		lastFolders: req.session.lastFolders,
		enableUpload,
		enableClose,
		text: 'Shutdown Server...'
	})
	await new Promise(resolve => setTimeout(
		resolve,
		(5000) // 5s
	))
	return process.exit()
})

app.get('/login', (req, res) => {
	console.log('[!] Login user')
	return res.render('login', {
		dark,
		lastFolders: req.session.lastFolders,
		enableUpload,
		enableClose
	})
})

app.get('/singout', (req, res) => {
	console.log('[!] Sing out user')
	req.session.password = ''
	req.session.lastFolders = []
	return res.render('singout', {
		dark,
		lastFolders: req.session.lastFolders,
		enableUpload,
		enableClose,
		text: 'Removing database...'
	})
})

app.get(['/', '/files/:dir', '/files/*', '/files', '/download'], async (req, res) => {
	let dir = ''
	if (req.params.dir) {
		dir = `${req.params.dir}/`
	} else if (req.originalUrl.startsWith('/files/')) {
		dir = `${req.originalUrl.replace('/files/', '')}/`
	}

	dir = decodeURIComponent(dir)
	console.log(`[!] Open Folder: ${dir == '' ? 'root' : dir}`)

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

	const data = await getDirFiles(dir)
	if (!data) {
		return res.render('alert', {
			dark,
			lastFolders: req.session.lastFolders,
			enableUpload,
			enableClose,
			text: 'No has files or folders!.'
		})
	}

	return res.render('files', {
		dark,
		upload: true,
		lastFolders: req.session.lastFolders,
		enableUpload,
		enableClose,
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
	const {file} = req.body
	if (!file) {
		return res.send('Falid!')
	}

	return res.sendFile(file, optionsSend(file), err => {
		if (err) {
			console.log(`[-] Error: ${err}`)
		} else {
			console.log(`[+] Send file: ${file}`)
		}
	})
})

app.post('/upload', upload.any(), (req, res) => {
	if (!enableUpload) {
		return res.send('Upload disabled!')
	}

	req.files.map(e => {
		console.log(`[+] Receive: ${e.originalname}`)
	})
	return res.send('Done!')
})

app.post('/upload-web', async (req, res) => {
	if (!enableUpload) {
		return res.send('Upload disabled!')
	}

	const {url} = req.body
	return download(url).then(data => {
		fs.writeFileSync(path.join(uploadPath, filenamifyUrl(url)), data)
		res.redirect('/files/uploads')
	}).catch(error => {
		console.log('[!] Error', error)
		res.render('alert', {
			dark,
			lastFolders: req.session.lastFolders,
			enableUpload,
			enableClose,
			text: `Error: ${error}`
		})
	})
})

app.listen(app.get('port'), () => {
	console.log(`[!] Open browser: http://localhost:${app.get('port')} or YOU_IP:${app.get('port')}`)
	console.log('[!] Help in http://URL_FILEXSHARED/help')
})

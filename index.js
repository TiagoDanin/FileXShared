const fs = require('fs')
const path = require('path')
const mime = require('mime')
const express = require('express')
const exphbs  = require('express-handlebars')
const filenamify = require('filenamify')

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
			'Content-type': mime.getType(file)
		}
	}
}

app.engine('handlebars', exphbs({defaultLayout: 'main'}))
app.set('view engine', 'handlebars')
//app.enable('view cache')

app.use('/uikit', express.static(`${__dirname}/node_modules/uikit/dist/`))
app.use('/files', express.static(dirRoot))

app.get('/', function (req, res) {
	res.sendFile('a.mp3', optionsSend('a.mp3'), function (err) {
		if (err) {
			console.log(err)
		} else {
			console.log('Sent!')
		}
	})
	//res.render('files')
})

console.log('Done!')
app.listen(3000)

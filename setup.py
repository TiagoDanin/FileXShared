#!/usr/bin/env python3
# setup.py

from distutils.core import setup

setup(
	name='FileXShared',
	version ='1.0',
	description = 'Share files Fast and Easy, on your local network!',
	long_description = '''
	FileXShared
	===========
	Share files Fast and Easy, on your local network!

	Run in Terminal
	===============
	$> FileXShared
	''',
	author = 'Tiago Danin',
	author_email = 'TiagoDanin@outlook.com',
	license = 'AGPLv3',
	url = 'https://TiagoDanin.github.io/FileXShared/',
	scripts=['FileXShared'],
	install_requires=['Flask'],
	classifiers = [
		'Natural Language :: English',
		'Operating System :: MacOS',
		'Operating System :: Unix',
		'Programming Language :: Python :: 3',
		'Programming Language :: Python :: 3.0',
		'Programming Language :: Python :: 3.1',
		'Programming Language :: Python :: 3.2',
		'Programming Language :: Python :: 3.3',
		'Programming Language :: Python :: 3.4',
		'Programming Language :: Python :: 3.5',
		'Topic :: Utilities'
	],
	keywords = 'file x shared share fast easy local network web net webapp'
)

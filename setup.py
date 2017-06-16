#!/usr/bin/env python3
# setup.py

from setuptools import setup

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
	install_requires=['flask'],
	classifiers = [
		'Natural Language :: English',
		'Operating System :: MacOS',
		'Operating System :: Unix',
		'Programming Language :: Python :: 3',
		'Programming Language :: Python :: 3.3',
		'Programming Language :: Python :: 3.4',
		'Programming Language :: Python :: 3.5',
		'Programming Language :: Python :: 3.6',
		'Topic :: Utilities'
	],
	keywords = 'file x shared share fast easy local network web net webapp'
)

.PHONY: all chrome firefox all-dev chrome-dev firefox-dev clean
.DEFAULT: all

all: chrome firefox

chrome: build/chrome/src/* build/chrome/tab-saver.zip

build/chrome/tab-saver.zip: build/chrome/src/*
	cd build/chrome/src && zip -r ../tab-saver.zip .

build/chrome/src/*: src/common/* src/chrome/* | build/chrome/src
	cp -r src/common/* build/chrome/src
	cp -r src/chrome/* build/chrome/src

build/chrome/src:
	mkdir -p $@

firefox: build/firefox/src/* build/firefox/tab-saver.zip

build/firefox/tab-saver.zip: build/firefox/src/*
	cd build/firefox/src && zip -r ../tab-saver.zip .

build/firefox/src/*: src/common/* | build/firefox/src
	cp -r src/common/* build/firefox/src

build/firefox/src:
	mkdir -p $@

all-dev: chrome-dev firefox-dev

chrome-dev: build/chrome-dev/*

build/chrome-dev/*: src/common/* src/chrome/* | build/chrome-dev
	cp -r src/common/* build/chrome-dev
	cp -r src/chrome/* build/chrome-dev

build/chrome-dev:
	mkdir -p $@

firefox-dev: build/firefox-dev/tab-saver.zip

build/firefox-dev/tab-saver.zip: build/firefox-dev/src/*
	cd build/firefox-dev/src && zip -r ../tab-saver.zip .

build/firefox-dev/src/*: src/common/* src/firefox-dev/* | build/firefox-dev/src
	cp -r src/common/* build/firefox-dev/src
	cp -r src/firefox-dev/* build/firefox-dev/src

build/firefox-dev/src:
	mkdir -p $@

clean:
	rm -rf build
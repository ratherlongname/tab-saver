.PHONY: dev clean
.DEFAULT: dev

dev: tab-saver.zip

tab-saver.zip: background-script.js manifest.json icons/*.png
	-rm -f tab-saver.zip
	zip -r tab-saver . -i manifest.json icons/*.png background-script.js

clean:
	-rm -f tab-saver.zip
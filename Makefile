.PHONY: clean
.DEFAULT: tab-saver.zip

tab-saver.zip: src/*
	-rm -f tab-saver.zip
	cd src/ && zip -r ../tab-saver.zip .

clean:
	-rm -f tab-saver.zip
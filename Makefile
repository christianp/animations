FPS=60

all: build movie

build:
	rm -rf pngs
	mkdir pngs
	node cli.js

movie: squiangle.mp4

squiangle.mp4: pngs
	ffmpeg -r $(FPS) -f image2 -i pngs/squiangle-%04d.png -vcodec libx264 -crf 25 -pix_fmt yuv420p $@ -y

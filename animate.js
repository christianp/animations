const { createCanvas } = require('canvas');
const { spawn} = require('child_process');
const fs = require('fs');
const path = require('path');

/** Render an animation to a .mp4 file. A sequence of frames is rendered to png files, then ffmpeg is used to make a movie.
 * `options` is an object containing:
 *
 * draw(context, t) - a function given a canvas context and a time between 0 and 1. It should draw a frame of the animation at the given time.
 * runtime - the number of seconds that the animation should run for. `t` is 1 at the end of the runtime
 * fps - the number of frames per second to render
 * size - the canvas will have this width and height, in pixels. The context is scaled to a 100×100 box so the draw function doesn't need to know this value.
 * makemovie - if false, only the png files are generated, not the movie
 */
exports.animate = function(options) {
    const {draw,runtime,fps,size,makemovie} = options;
    const outfile = path.parse(process.mainModule.filename).name+'.mp4';
    const fs = require('fs');
    const frames = Math.ceil(runtime*fps);

    for(let f of fs.readdirSync('pngs')) {
        if(f.match(/\.png$/)) {
            fs.unlinkSync(`pngs/${f}`);
        }
    }

    function frame(i) {
        if(i>=frames) {
            if(makemovie) {
                movie();
            }
            return;
        }
        const t = i/(frames);
        const canvas = createCanvas(size,size);
        const ctx = canvas.getContext('2d');
        const scale = size/100;
        ctx.scale(scale,scale);
        draw(ctx,t);
        const filename = `pngs/${(i+'').padStart(4,'0')}.png`;
        console.log(`${i+1}/${frames}`);
        const stream = canvas.createPNGStream();
        const f = fs.createWriteStream(filename);
        stream.pipe(f);
        f.on('finish',()=>frame(i+1));
    }
    function movie() {
        const ffmpeg = spawn('ffmpeg',['-r',fps,'-f','image2','-i','pngs/%04d.png','-vcodec','libx264','-crf','25','-pix_fmt','yuv420p',outfile,'-y']);
        ffmpeg.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        ffmpeg.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });
        ffmpeg.on('close',() => {
            console.log(`Rendered to ${outfile}`);
        })
    }

    frame(0);
}

exports.ease_cubicinout = function(t) {
    return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
}

exports.lerp = function(a,b,t) {
    return (1-t)*a+t*b;
}

/* Clamps t to 0 when less than a, 1 when greater than b, and change linearly between a and b.
 */
exports.between = function(a,b,t) {
    if(b>1 && t<a) {
        a -= 1;
        b -= 1;
    }
    t -= a;
    t /= b-a;
    return Math.max(0,Math.min(1,t));
}

/* Split the interval [0,1] into n sections. Returns an array [f,dt], where f is the number of the section, and dt is 0 at the start of the section and 1 at the end.
 */
exports.enframe = function(n,t) {
    const f = Math.floor(n*t);
    const dt = (n*t)%1;
    return [f,dt];
}

/* When substituting numbers into a template literal, format them to two decimal places.
 */
exports.dp = function(x){
    const out = [];
    for(let i=0;i<x.length-1;i++) {
        out.push(x[i]);
        out.push(arguments[i+1].toFixed(2));
    }
    out.push(x[x.length-1]);
    return out.join('');
}

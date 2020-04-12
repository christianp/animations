const {animate,dp,ease_cubicinout,lerp,between,color,golden,enframe,blur} = require('./animate');

const ROWS = 3;
const COLUMNS = ROWS;
const PERIOD = ROWS*COLUMNS;
const w = 100/ROWS;
const GAP = w/4;
const h = 100/COLUMNS;
const step = 1/(ROWS+0.5);

function draw(ctx,t1,t2) {
    ctx.fillStyle = color(240,50,15);
    ctx.fillRect(0,0,100,100);

    blur(t1,t2,ctx,tt => {
        const [f,dt] = enframe(PERIOD,tt);
        function flip(x,y) {
            return y%2 ? COLUMNS-1-x : x
        }
        function rect(x,y,px,py) {
            const pj = flip(px,y);
            const z = COLUMNS*y+x;
            ctx.fillStyle = color(golden(360,360,(z+f)%PERIOD),90,70);
            ctx.fillRect(pj*w+GAP/2,py*h+GAP/2,w-GAP,h-GAP);
        }

        for(let y=0;y<=ROWS;y++) {
            ctx.fillStyle = color(90,100,70);
            const lift = ease_cubicinout(between(step*y,step*(y+0.5),dt));
            const slide = ease_cubicinout(between(step*(y+0.5),step*(y+1),dt));
            const sign = 2*(y%2)-1;
            for(let x=1;x<ROWS;x++) {
                rect(x,y,(x-slide), y);
            }
            const lx = 0;
            rect(lx, y, lx, (y-lift));
        }
    });
}

animate({
    draw: draw,
    runtime: 27,
    fps: 60,
    size: 1000,
    makemovie: true
});

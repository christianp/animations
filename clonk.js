const {animate,dp,ease_cubicinout,lerp,between,color,golden,enframe,blur} = require('./animate');

function ease_linearinout(t) {
    return 1-2*Math.abs(t-0.5);
}

const SIZE = 6;
const x_order = [0,3,2,1,4];
const y_order = [4,0,1,3,2];
const GAP = 20;
const w = 100/SIZE;
const g = GAP/SIZE;

function draw(ctx,t1,t2) {
    ctx.fillRect(0,0,100,100);

    blur(t1,t2,ctx,dt => {
        const t = between(0.05,0.95,ease_linearinout(dt));
        for(let x=0;x<SIZE;x++) {
            for(let y=0;y<SIZE;y++) {
                ctx.fillStyle = color(golden(360,360,y*SIZE+x),70,70);
                let dy = 0;
                let dx = 0;
                for(let i=0;i<SIZE-1;i++) {
                    dx += ease_cubicinout(between(i/SIZE,(i+1/2)/SIZE,t))*(x<=x_order[(i+y)%x_order.length] ? g : 0);
                    dy += ease_cubicinout(between((i+1/2)/SIZE,(i+1)/SIZE,t))*(y<=y_order[(i+x)%y_order.length] ? g : 0);
                }
                ctx.fillRect(x*w+g/2+dx,y*w+g/2+dy,w-g,w-g);
            }
        }
    });
}

animate({
    draw: draw,
    runtime: 5,
    fps: 60,
    size: 1000,
    makemovie: true
});

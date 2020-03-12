const {animate, ease_cubicinout, lerp, between, enframe, dp, golden} = require('./animate');

const R = 48/64;

function draw(ctx,t) {
    ctx.fillRect(0,0,100,100);
    ctx.translate(50,50);

    ctx.strokeStyle = 'white';
    function angle(n,i) {
        const w = width(n);
        const off = -(n%2)*w/2;
        return i*w+off;
    }
    function width(n) {
        return n==-1 ? 0 : 2*Math.PI / Math.pow(2,n);
    }
    function radius(n) {
        return n==-1 ? 0 : Math.pow(2,n)*R;
    }
    function circle(n,dt) {
        const segments = Math.pow(2,n);
        const r = lerp(radius(n),radius(n-1),dt);
        const outw = width(n);
        const inw = width(n-1);
        for(let i=0;i<segments;i+=2) {
            const ini = (i-(i%4))/2;
            const d = (i%4)/2;
            const dir = (n%2)*2-1;
            const start = lerp(angle(n,i),angle(n-1,ini)+width(n-1)*2*dir,dt) + dt*d*inw/2;
            const end = start+lerp(outw,inw/2,dt);
            ctx.beginPath();
            ctx.arc(0,0,r,start,end);
            ctx.stroke();
        }
    }

    const FRAMES = 6;
    const [f,dt] = enframe(FRAMES,t);
    const colors = [];
    for(let i=0;i<FRAMES;i++) {
        colors.push(`hsl(${golden(360,360,i)},50%,50%)`);
    }
    const ddt = ease_cubicinout(dt);
    for(let i=8;i>=0;i--) {
        ctx.fillStyle = colors[(i+f)%FRAMES];
        ctx.beginPath();
        ctx.arc(0,0,lerp(radius(i),radius(i-1),ddt),0,2*Math.PI);
        ctx.fill();
    }
    for(let i=7;i>=0;i--) {
        circle(i,ddt);
    }
}

animate({
    draw:draw,
    runtime: 12,
    fps: 60,
    size: 1000,
    makemovie: true
})

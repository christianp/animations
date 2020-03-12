const {animate,dp,ease_cubicinout,lerp,between,color,golden,enframe} = require('./animate');

const TIME = 1.5;
const STEPS = 7;
const FIZZ = 0.2;

for(let frame=0;frame<6;frame++) {
    for(let i=0;i<3;i++) {
        const k = (frame+frame%2)/2;
        const j = (i+k)%3
        console.log(frame,i,k,j);
    }
    console.log('');
}

function draw(ctx,t) {
    ctx.fillStyle = 'hsl(0,30%,0%)';
    ctx.fillRect(0,0,100,100);
    ctx.translate(50,50);

    const [frame,t1] = enframe(6,t);
    const tt = ease_cubicinout(frame%2 ? 1-t1 : t1);

    const points = [];
    for(let i=0;i<3;i++) {
        const k = (frame+frame%2)/2;
        const j = (i+k)%3
        const l = (frame-frame%2)/2;
        const an = Math.PI*(2/3*(i+k) + 5/6);
        points.push({
            x:40*Math.cos(an), 
            y:40*Math.sin(an), 
            t: i==0 ? 0 : 1-FIZZ,
            hue: 120*j,
            sat: j==l ? 0 : 100
        });
    }

    function tri(a,b,c,n=0,face=0) {
        if(n>STEPS) {
            return;
        }
        const [d,e,f] = [[a,b],[a,c],[b,c]].map(([p1,p2])=>{
            const dt = between(p1.t,p2.t,tt);
            if(n==STEPS && dt>0) {
                ctx.strokeStyle = color((p1.hue+p2.hue)/2,(p1.sat+p2.sat)/2,lerp(20,50,between(p1.t,p2.t+FIZZ,tt)));
                ctx.beginPath();
                ctx.moveTo(p1.x,p1.y);
                ctx.lineTo(lerp(p1.x,p2.x,dt),lerp(p1.y,p2.y,dt));
                ctx.stroke();
            }

            const p = {};
            Object.keys(p1).forEach(k=>{
                p[k] = (p1[k]+p2[k])/2;
            });
            return p;
        });
        f.t = (f.t+d.t)/2;

        const dt1 = between(a.t,b.t,tt);
        if(false && n==STEPS && dt1>0) {
            ctx.fillStyle = dp(0)`rgb(${(a.r+b.r+c.r)*255/3},${(a.g+b.g+c.g)*255/3},${(a.b+b.b+c.b)*255/3})`;
            ctx.beginPath();
            ctx.moveTo(a.x,a.y);
            ctx.lineTo(lerp(a.x,b.x,dt1),lerp(a.y,b.y,dt1));
            ctx.lineTo(lerp(a.x,c.x,dt1),lerp(a.y,c.y,dt1));
            ctx.closePath();
            ctx.fill();
        }

        const dt2 = between(e.t,f.t,tt);
        if(false && dt2>0) {
            ctx.fillStyle = dp(0)`rgb(${(a.r+b.r+c.r)*255/3},${(a.g+b.g+c.g)*255/3},${(a.b+b.b+c.b)*255/3})`;
            ctx.beginPath();
            ctx.moveTo(e.x,e.y);
            ctx.lineTo(lerp(e.x,f.x,dt2),lerp(e.y,f.y,dt2));
            ctx.lineTo(lerp(d.x,f.x,dt2),lerp(d.y,f.y,dt2));
            ctx.lineTo(d.x,d.y);
            ctx.closePath();
            ctx.fill();
        }

        tri(a,e,d,n+1);
        tri(d,f,b,n+1,1);
        tri(e,c,f,n+1,2);
    }

    ctx.strokeStyle = 'white';
    ctx.lineWidth = 0.1;
    const [a,b,c] = points;
    tri(a,b,c);
}

animate({
    draw: draw,
    runtime: 12,
    fps: 60,
    size: 1000,
    makemovie: true
})

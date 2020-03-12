const {animate,dp,ease_cubicinout,lerp,between,color,golden,enframe} = require('./animate');

const SMOOSH = 5;
const G = -5000;
const FLOORS = 4;
const N = 30;

function distance(a,b) {
    const [dx,dy] = [b.x-a.x,b.y-a.y];
    return Math.sqrt(dx*dx+dy*dy);
}

function draw(ctx,t,t2) {
    ctx.fillRect(0,0,100,100);

    function ballpos(vx,vy,r,floor,t) {
        const t1 = (-r-50)/vx+0.5;
        const t2 = (100+r-50)/vx+0.5;
        const period = -2*vy/G;
        const dt = t%period;
        const b = (t-dt)/period;
        const x = 50+(t-0.5)*vx;
        const y = (vy*dt + G*dt*dt/2)*Math.pow(0.7,b);
        return {x,y};
    }
    function floorpos(floor) {
        return (floor-0.25)*100/FLOORS;
    }

    for(let floor=0;floor<=FLOORS;floor++) {
        ctx.fillStyle = color(300,lerp(20,50,floor/FLOORS),lerp(20,90,floor/FLOORS));
        ctx.fillRect(0,floorpos(floor),100,100);
    }
    for(let floor=0;floor<FLOORS;floor++) {
        for(let j=0;j<N;j++) {
            const i = j+floor*N;
            const start = 1-i/(N*FLOORS);
            const size = golden(100,4,i)+2;

            const vx = size*60;
            const vy = -G/(size*2.5+golden(100,2,i));
            const r = size;
            const bfloor = floorpos(floor+1);
            const bt = dt => between(start,start+0.6,lerp(t,t2,dt));
            const p1 = ballpos(vx,vy,r,bfloor,bt(0));
            const p2 = ballpos(vx,vy,r,bfloor,bt(1));
            const dist = distance(p1,p2);
            const steps = Math.ceil(dist*8);

            const points = [];
            for(let s=0;s<steps;s++) {
                points.push(ballpos(vx,vy,r,bfloor,bt(s/steps)));
            }
            ctx.globalAlpha = 0.03;
            ctx.fillStyle = 'black';
            points.forEach(({x,y})=>{
                ctx.beginPath();
                ctx.arc(x-0.5,bfloor-r-y+0.5,r,0,2.1*Math.PI);
                ctx.fill();
            });
            ctx.globalAlpha = Math.pow(0.5,1/steps);
            ctx.fillStyle = color(golden(360,360,i),golden(100,50,i)+50,60);
            points.forEach(({x,y})=>{
                ctx.beginPath();
                ctx.arc(x,bfloor-r-y,r,0,2.1*Math.PI);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }
    }
}

animate({
    draw: draw,
    runtime: 10,
    fps: 60,
    size: 1000,
    makemovie: true
});

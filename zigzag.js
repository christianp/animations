const {animate,dp,ease_cubicinout,lerp,between,color,golden,enframe} = require('./animate');

const GRID = 5;

const axes = [];
for(let i=0;i<3;i++) {
    axes.push({x:Math.cos(i*Math.PI*2/3),y:Math.sin(i*Math.PI*2/3)});
}

function decompose(a,b) {
    const [dx,dy] = [b.x-a.x, b.y-a.y];
    let mindist = Infinity;
    let closest;
    for(let i=0;i<3;i++) {
        const [i1,i2] = [0,1,2,0].slice(i,i+2);
        const [a1,a2] = [axes[i1],axes[i2]];
        let lambda,mu;
        if(a2.x==0) {
            lambda = dx/a1.x;
            mu = (dy-lambda*a1.y)/a2.y;
        } else if(a2.y==0) {
            lambda = dy/a1.y;
            mu = (dx-lambda*a1.x)/a2.x;
        } else {
            lambda = (dy-dx*a2.y/a2.x)/(a1.y-a1.x*a2.y/a2.x);
            mu = (dy-lambda*a1.y)/a2.y;
        }
        const dist = lambda+mu;
        if(dist<mindist) {
            mindist = dist;
            closest = {a1:a1, a2:a2, d1:lambda, d2:mu};
        }
    }
    return closest;
}

function distance(a,b) {
    const [dx,dy] = [b.x-a.x,b.y-a.y];
    return Math.sqrt(dx*dx+dy*dy);
}

const points = [];
for(let i=1;i<30;i++) {
    const an = Math.random()*2*Math.PI;
    const r = Math.sqrt(i)*5;
    const p1 = {x:r*Math.cos(an), y: r*Math.sin(an)};
    const {a1,a2,d1,d2} = decompose({x:0,y:0},p1);
    const p2 = {x:a1.x*Math.round(d1/GRID)*GRID + a2.x*Math.round(d2/GRID)*GRID, y:a1.y*Math.round(d1/GRID)*GRID + a2.y*Math.round(d2/GRID)*GRID, distances: {}};
    points.push(p2);
}
points.forEach((p,i)=>{
    points.forEach((p2,j)=>{
        if(j<=i) {
            return;
        }
        const d = distance(p,p2);
        p.distances[j] = p2.distances[i] = d;
    })
});
points.forEach((p,i) => {
    let mindist = Infinity;
    let closest;
    Object.entries(p.distances).forEach(([j,d])=>{
        if(d<mindist) {
            mindist = d;
            closest = j;
        }
    });
    p.closest = closest;
});

function draw(ctx,t) {
    ctx.fillRect(0,0,100,100);
    ctx.translate(50,50);

    ctx.strokeStyle = '#333333';

    const [f,dt] = enframe(points.length-1,t);
    const [a,b] = [points[f],points[f+1]];

    const {a1,a2,d1,d2} = decompose(a,b);
    ctx.beginPath()
    ctx.moveTo(a.x,a.y);
    const m = {x: a.x+d1*a1.x, y:a.y+d1*a1.y};
    ctx.lineTo(m.x,m.y);
    ctx.lineTo(b.x,b.y);
    ctx.stroke();
    points.forEach(p=>{
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(p.x,p.y,2,0,2.1*Math.PI);
        ctx.fill();
    });
}

animate({
    draw: draw,
    runtime: 1,
    fps: 60,
    size: 400,
    makemovie: false
});

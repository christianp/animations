const {animate, ease_cubicinout, lerp, between, enframe, dp} = require('./animate');

const R = 5;

function golden(k) {
  return ((1+Math.sqrt(5))/2 * k);
}

const _thue = {0:0};
function thue(n) {
    if(_thue[n]!==undefined) {
        return _thue[n];
    }
    const t = n%2 ? 1-thue((n-1)/2) : thue(n/2);
    _thue[n] = t;
    return t;
}

function tri_coord(x,y) {
    const cx = R*(x-(x%2)-(y%2)-1)/2;
    const h = R*Math.sqrt(3)/2;
    const cy = h*y;
    const [a,b,c,d] = [
        {x:cx,y:cy},
        {x:cx+R,y:cy},
        {x:cx+0.5*R,y:cy-h},
        {x:cx+1.5*R,y:cy-h}
    ];
    const [A,B,C] = x%2 ? [a,b,c] : [b,c,d];
    return [A,B,C];
}

function draw(ctx,t) {
    ctx.fillStyle = 'white';
    ctx.fillRect(0,0,100,100);
    let [x,y] = [0,0];
    let an = 0;
    const anstep = Math.PI/3;
    let dir = 1;
    const [f,dt] = enframe(80,t);
    for(let i=0;i<=f;i++) {
        ctx.lineWidth = 5;
        ctx.strokeStyle = dp`hsl(${golden(90*Math.floor(i/6))},50%,50%)`;
        ctx.beginPath();
        ctx.moveTo(x+R*Math.cos(an*anstep),y+R*Math.sin(an*anstep));
        const ddt = i==f? dt : 1;
        if(thue(i)) { // wind round another step from here
            ctx.arc(x,y,R,an*anstep,(an+ddt*dir)*anstep,dir==-1);
        } else {
            [x,y] = [x+2*R*Math.cos(an*anstep), y+2*R*Math.sin(an*anstep)];
            an += 3;
            dir = -dir;
            ctx.arc(x,y,R,an*anstep,(an+ddt*dir)*anstep,dir==-1);
        }
        an += dir;
        ctx.stroke();
    }
}

animate({
    draw: draw,
    runtime: 5,
    fps: 60,
    size: 1000,
    makemovie: true
})

const {animate, ease_cubicinout, lerp, between, enframe, dp} = require('./animate');

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

function draw(ctx,t) {
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,100,100);
    const R = 50;
    const TURN = Math.PI*2*25;
    const INC = 0.0001;
    ctx.translate(50,50);
    ctx.strokeStyle = 'white';
    const a = R/TURN;
    function angle(t) {
        return (TURN)*t;
    }
    function radius(t) {
        return angle(t)*a;
    }
    function length(t) {
        const an = angle(t);
        return 1/2*a*(an*Math.sqrt(1+an*an)+Math.log(an+Math.sqrt(1+an*an)));
    }
    function spiral(cx,cy,dir,from,to) {
        let [x,y] = [0,0];
        ctx.beginPath();
        for(let i=from;i<=to;i+=INC) {
            const an = angle(i)*dir;
            const r = radius(i);
            const l = length(i);
            const [x2,y2] = [cx+dir*Math.cos(an)*r,cy+Math.sin(an)*r];
            if(i==from) {
                ctx.moveTo(x2,y2);
            } else {
                ctx.lineTo(x2,y2);
            }
            [x,y] = [x2,y2];
        }
        ctx.stroke();
    }

    let [f,dt] = enframe(2,t);
    dt = f==1 ? 1-dt : dt;
    spiral(-R,0,1,between(1/3,2/3,dt),between(0,1/3,dt));
    spiral(R,0,-1,1-between(1/3,2/3,dt),1-between(2/3,1,dt));
}

animate({
    draw: draw,
    runtime: 60,
    fps: 1,
    size: 400,
    filename: __filename,
    makemovie: true
});

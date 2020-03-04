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
    const R = 10;
    const GAP = 10;

    ctx.lineJoin = 'round';
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,100,100);
    ctx.fillStyle = 'hsl(240,50%,50%)';
    ctx.strokeStyle = 'hsl(240,50%,50%)';

    function square(a,b,t,bt,frame) {
        const [dx,dy] = [b.x-a.x,b.y-a.y];
        const [c,d] = [{x:a.x+dy*t,y:a.y-dx*t}, {x:b.x+dy*t,y:b.y-dx*t}];
        const [e,f] = [{x:lerp(a.x,c.x,bt),y:lerp(a.y,c.y,bt)},{x:lerp(b.x,d.x,bt),y:lerp(b.y,d.y,bt)}];
        ctx.moveTo(e.x,e.y);
        ctx.lineTo(c.x,c.y);
        ctx.lineTo(d.x,d.y);
        ctx.lineTo(f.x,f.y);
        ctx.closePath();
        return [c,d];
    }

    function triangle(a,b,t,bt,frame) {
        const [dx,dy] = [b.x-a.x,b.y-a.y];
        const l = Math.sqrt(3)/2;
        const c = {x:(a.x+b.x)/2+dy*t*l,y:(a.y+b.y)/2-dx*t*l};
        const [ba,bb,bc] = thue(frame) ? [a,b,c] : [b,c,a];
        const d = {x:lerp(ba.x,(bb.x+bc.x)/2,bt), y:lerp(ba.y,(bb.y+bc.y)/2,bt)}
        ctx.moveTo(d.x,d.y);
        ctx.lineTo(bc.x,bc.y);
        ctx.lineTo(bb.x,bb.y);
        ctx.closePath();
        return [bc,bb];
    }

    function shape(a,b,t,bt,f,offset) {
        const col1 = dp`hsl(${golden(360*offset)},50%,50%)`
        const col2 = 'black';//dp`hsl(${golden(360*(offset+100))},50%,50%)`
        ctx.strokeStyle = col1;
        ctx.fillStyle = (f+1)%2==0 ? col1 : col2;

        const fn = f%2==0 ? square : triangle;
        ctx.beginPath();
        const [c,d] = fn(a,b,t,bt,f);
        if(t>0 && bt<1) {
            ctx.fill();
            ctx.stroke();
        }
        return [c,d];
    }

    function wiggle(offset) {
        const wt = between(offset/20,offset/20+((offset%5)+5)*1/10,t);
        const steps = 4*100/R;
        const [frame,dt] = enframe(steps,wt);
        const d = ((7*(offset))%10)/(100/R);
        const [x,y,dx,dy] = [d*100+R,0,-R,0];
        let [a,b] = [{x:x,y:y},{x:x+dx,y:y+dy}];

        for(let i=0;i<frame;i++) {
            const bt = ease_cubicinout(between((i+GAP)/steps,(i+GAP+1)/steps,wt));
            [a,b] = shape(a,b,1,bt,i+100*offset,offset);
        }
        shape(a,b,ease_cubicinout(dt),0,frame+100*offset,offset);
    }

    for(let i=0;i<20;i+=2) {
        wiggle(i);
    }
}

animate({
    draw: draw,
    runtime: 40,
    fps: 60,
    size: 1000,
    outfile: 'tiling.mp4',
    makemovie: true
});

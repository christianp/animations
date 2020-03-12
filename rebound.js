const {animate,dp,ease_cubicinout,lerp,between,color} = require('./animate');

const R = 60;
const APPROACH = 140;
const GAP = 4;
const TRAIL = 40;

const N = 80;
const paths = [];
for(let i=0;i<N;i++) {
    paths.push({a1:Math.random()*2*Math.PI, a2:Math.random()*2*Math.PI, r: Math.random()*R});
}

function draw(ctx,t) {
    ctx.fillStyle = 'hsl(240,30%,90%)';
    ctx.fillRect(0,0,100,100);
    ctx.translate(50,50);

    function total_length(a1,a2,R) {
        if(a2<a1) {
            a2 += 2*Math.PI;
        }
        return 2*APPROACH + R*Math.abs(a2-a1);
    }
    function projectile(i,R,a1,a2,dt) {
        function oncircle(a) {
            return {x:R*Math.cos(a),y:R*Math.sin(a)};
        }
        if(a2<a1) {
            a2 += 2*Math.PI;
        }
        const tl = total_length(a1,a2,R);
        const pos = dt*tl;
        const tpos = Math.max(0,pos-TRAIL);
        const tt = Math.max(0,dt - TRAIL/tl);
        const [p1,p2] = [a1,a2].map(oncircle);
        const p0 = {x:p1.x+APPROACH*Math.cos(a1-Math.PI/2),y:p1.y+APPROACH*Math.sin(a1-Math.PI/2)};
        const p3 = {x:p2.x+APPROACH*Math.cos(a2+Math.PI/2),y:p2.y+APPROACH*Math.sin(a2+Math.PI/2)};
        function at1(dt) {
            const t0 = between(0,APPROACH/tl,dt);
            return {x:lerp(p0.x,p1.x,t0),y:lerp(p0.y,p1.y,t0)};
        }
        function circletime(dt) {
            return between(APPROACH/tl,1-APPROACH/tl,dt);
        }
        function at2(dt) {
            const t1 = circletime(dt);
            return oncircle(lerp(a1,a2,t1));
        }
        function at3(dt) {
            const t2 = between(1-APPROACH/tl,1,dt);
            return {x:lerp(p2.x,p3.x,t2),y:lerp(p2.y,p3.y,t2)};
        }
        function at(pos,dt) {
            if(pos<APPROACH) {
                return at1(dt);
            } else if(pos<tl-APPROACH) {
                return at2(dt);
            } else {
                return at3(dt);
            }
        }

        const now = at(pos,dt);

        ctx.strokeStyle = ctx.fillStyle = color(golden(360,120,i),50,50);
        ctx.beginPath();
            const t1 = at(tpos,tt);
            ctx.moveTo(t1.x,t1.y);
            if(tpos<APPROACH) {
                const t2 = at1(dt);
                ctx.lineTo(t2.x,t2.y);
            }
            if(tpos<tl-APPROACH && pos>=APPROACH) {
                const [b1,b2] = [lerp(a1,a2,circletime(tt)), lerp(a1,a2,circletime(dt))];
                ctx.arc(0,0,R,b1,b2);
            }
            if(pos>tl-APPROACH) {
                const t3 = at3(dt);
                ctx.lineTo(t3.x,t3.y);
            }
            ctx.stroke();

        ctx.beginPath();
        ctx.arc(now.x,now.y,2,0,2.01*Math.PI);
        ctx.fill();
    }

    paths.forEach((p,i) => {
        const {a1,a2,r} = p;
        const max_dist = 2*APPROACH + 2*Math.PI*r;
        const duration = 1/4*total_length(a1,a2,r)/max_dist;
        const start = lerp(0,0.7,1-ease_cubicinout(i/N));
        projectile(i,r,a1,a2,between(start,start+duration,t));
    })
}

animate({
    draw: draw,
    runtime: 10,
    fps: 60,
    size: 1000,
    makemovie: true
});

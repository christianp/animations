const {animate,dp,ease_cubicinout,lerp,between,color,golden,enframe,blur} = require('./animate');

const BOING = 0.1;

function draw(ctx,t1,t2) {
    ctx.fillStyle = color(90,25,00);
    ctx.fillRect(0,0,100,100);

    ctx.translate(50,50);

    ctx.fillStyle = color(210,45,50);
    ctx.beginPath();
    ctx.ellipse(0,0,32,32,0,0,2*Math.PI)
    ctx.fill();

    function tick(time) {
        const r = 30;
        const angle = time*(2*Math.PI)/12-Math.PI/2;
        return [r*Math.cos(angle), r*Math.sin(angle)];
    }

    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    for(let i=0;i<12;i++) {
        const [x,y] = tick(i);
        ctx.beginPath();
        ctx.moveTo(x*.9,y*.9);
        ctx.lineTo(x,y);
        ctx.stroke();
        ctx.fill();
    }
    
    blur(t1,t2,ctx,function(t) {
        const [frame,dt] = enframe(12,t);

        const [tx1,ty1] = tick(frame);
        const [tx2,ty2] = tick(frame+1);

        function ease_cubic_out(t) {
            return Math.pow(1-t,3);
        }

        ctx.beginPath();
        ctx.moveTo(0,0);
        if(dt<1-BOING) {
            const ddt = ease_cubicinout(between(0,1-BOING,dt));
            const [cx1,cy1] = tick(frame+ddt);
            ctx.bezierCurveTo(cx1*0.5,cy1*0.5,tx1,ty1,tx1,ty1);
        } else {
            const wt = between(1-BOING,1,dt);
            const [cx2,cy2] = tick(frame+1-ease_cubic_out(wt)*Math.cos(10*Math.PI*wt));
            ctx.bezierCurveTo(tx2*0.5,ty2*0.5,cx2*0.9,cy2*0.9,cx2,cy2);
        }

        ctx.strokeStyle = 'white';
        ctx.stroke();
    });
}

animate({
    draw: draw,
    runtime: 60,
    fps: 60,
    size: 1000,
    makemovie: true
});

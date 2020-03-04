const {animate, ease_cubicinout, lerp, between, enframe} = require('./animate');

function draw(ctx,t) {
    const [c1,c2] = ['black','white'];

    const [frame,dt] = enframe(4,t);
    const flip = frame>=2 ? 1 : 0;

    const [bg,fg] = false ? [c1,c2] : [c2,c1];
    ctx.fillStyle = bg;
    ctx.fillRect(0,0,100,100);

    function squircle(x,y,push,dir) {
        const pt = push*(Math.sqrt(2)-1)
        const r = (1+pt*pt)/(2*pt)*R/2;
        const an = Math.asin(R/2/r);
        const d = Math.sqrt(r*r-R*R/4)-R/2;
        ctx.moveTo(x,y);
        switch(dir) {
            case 'up':
                ctx.lineTo(x-R/2,y-R/2);
                if(push==0) {
                    ctx.lineTo(x+R/2,y-R/2);
                } else {
                    ctx.arc(x,y+d,r,-an-Math.PI/2,an-Math.PI/2);
                }
                break;
            case 'right':
                ctx.lineTo(x+R/2,y-R/2);
                if(push==0) {
                    ctx.lineTo(x+R/2,y+R/2);
                } else {
                    ctx.arc(x-d,y,r,-an,an);
                }
                break;
            case 'bottom':
                ctx.lineTo(x+R/2,y+R/2);
                if(push==0) {
                    ctx.lineTo(x-R/2,y+R/2);
                } else {
                    ctx.arc(x,y-d,r,-an+Math.PI/2,an+Math.PI/2);
                }
                break;
            case 'left':
                ctx.lineTo(x-R/2,y+R/2);
                if(push==0) {
                    ctx.lineTo(x-R/2,y-R/2);
                } else {
                    ctx.arc(x+d,y,r,-an-Math.PI,an-Math.PI);
                }
                break;
        }
    }

    ctx.fillStyle = fg;
    const R = 10;
    const cells = 100/R;
    for(let cx=0; cx<=cells+3; cx+=1) {
        for(let cy=0; cy<=cells+3; cy+=2) {
            const x = cx*R - (frame==1)*lerp(-1,1,cx%2)*ease_cubicinout(dt)*R;
            const y = (cy-(cx%2)+flip)*R - (frame==3)*lerp(-1,1,cx%2)*ease_cubicinout(dt)*R;
            ctx.beginPath();
            const d = ease_cubicinout(Math.sin(dt*Math.PI))*(1-(frame%2));

            squircle(x,y,d,'up');
            squircle(x,y,d,'right');
            squircle(x,y,d,'bottom');
            squircle(x,y,d,'left');

            ctx.fill();
        }
    }
}

animate({
    draw: draw,
    runtime: 2,
    fps: 60,
    size: 1000,
    makemovie: true
});

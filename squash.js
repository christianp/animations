const {animate,dp,ease_cubicinout,lerp,between,color,golden,enframe,blur} = require('./animate');

const WIDTH = 6;
const CELLS = WIDTH*WIDTH;

function draw(ctx,t) {
    ctx.fillStyle = color(90,35,75);
    ctx.fillRect(0,0,100,100);

    ctx.translate(5,5);
    ctx.scale(0.9,0.9);

    const [frame,ddt] = enframe(CELLS,t);
    const dt = ease_cubicinout(between(0.2,0.8,ddt));

    const w_done = Math.floor(Math.sqrt(frame+1));
    const n_done = w_done*w_done;

    function colorfor(n) {
        return color(golden(360,360,n),90,70)
    }

    ctx.font = '6px sans-serif'
    
    function focus(x,y,w,h) {
        const size = Math.min(w,h);
        const er = size*0.1;
        return [x+w/2, y+h*1/3];
    };

    function fixate(pupil,look) {
        const [px,py] = pupil;
        const [lx,ly] = look;
        const [dx,dy] = [lx-px, ly-py];
        const d = Math.sqrt(dx*dx+dy*dy);
        return d<1e-10 ? [0,0] : [dx/d,dy/d];
    }

    function cell(n,x,y,w,h,look1,look2) {
        const size = Math.min(w,h);
        const br = size*0.1;
        const gap = br/2;
        x += gap;
        y += gap;
        w -= 2*gap;
        h -= 2*gap;
        if(br>0.1) {
            ctx.beginPath();
            ctx.moveTo(x+br,y);
            ctx.lineTo(x+w-br,y);
            br>0.1 && ctx.arcTo(x+w,y,x+w,y+br,br,br);
            ctx.lineTo(x+w,y+h-br);
            br>0.1 && ctx.arcTo(x+w,y+h,x+w-br,y+h,br,br);
            ctx.lineTo(x+br,y+h);
            br>0.1 && ctx.arcTo(x,y+h,x,y+h-br,br,br);
            ctx.lineTo(x,y+br);
            br>0.1 && ctx.arcTo(x,y,x+br,y,br,br);
            ctx.closePath();
            ctx.fillStyle = colorfor(n);
            ctx.fill();
            ctx.lineWidth = br/2;
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }

        const er = br;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        const [ex,ey] = focus(x,y,w,h);
        ctx.ellipse(ex-2*er,ey, er,er,0,0,2*Math.PI);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(ex+2*er,ey, er,er,0,0,2*Math.PI);
        ctx.fill();

        for(let [eex,eey] of [[ex-2*er,ey],[ex+2*er,ey]]) {
            const [lx1,ly1] = fixate([eex,ey], focus(...look1));
            const [lx2,ly2] = fixate([eex,ey], focus(...look2));
            const et = ease_cubicinout(between(0,0.2,ddt));
            const pr = er/4;
            const lx = lerp(lx1,lx2,et)*er/2;
            const ly = lerp(ly1,ly2,et)*er/2;

            /*
            ctx.beginPath();
            ctx.strokeStyle = 'gray';
            ctx.lineWidth = 1;
            ctx.moveTo(eex,eey);
            const t1 = focus(...look2);
            ctx.lineTo(t1[0],t1[1]);
            ctx.stroke();

            ctx.fillStyle = 'black';

            ctx.font = '6px sans-serif';
            ctx.fillText(dp`${ex} ${ey}`,ex,ey);
            ctx.fillText(dp`${look1[0]} ${look1[1]}`,ex,ey+8);
            ctx.fillText(dp`${look2[0]} ${look2[1]}`,ex,ey+16);
            ctx.font = '3px sans-serif';
            ctx.fillText(JSON.stringify(look2),ex,ey+24);
            */

            ctx.fillStyle = 'black';
            ctx.beginPath();
            ctx.ellipse(eex+lx, eey+ly, pr,pr, 0, 0,2*Math.PI);
            ctx.fill();
        }
    }

    if(frame==CELLS-1) {
        (function() {
            const ay = 100/0.9
            const shift = lerp(0,ay,dt);
            let sx = 0;
            let sy = 0;
            const w = 100/w_done;
            const h = 100/w_done;
            let down = false;
            let s = 0;
            let nn = 0;
            cell(0,0,-ay+shift,100,100,[0,-ay+shift,100,100],[0,shift,100,100]);
            while(s<w_done) {
                const slook1 = sx==w_done-1 && sy==w_done-1 ? [100-2*w,100-h+shift,w,h] : [100-w,100-h+shift,w,h];
                const slook2 = [0,-ay+shift,100,100];
                cell(nn,sx*w,sy*h+shift,w,h,slook1, slook2);
                if(down) {
                    sy += 1;
                    if(sy==s) {
                        sx = 0;
                        down = !down;
                    }
                } else {
                    sx += 1;
                    if(sx==s+1) {
                        s += 1;
                        sy = 0;
                        down = !down;
                    }
                }
                nn += 1;
            }
        })();
    } else {
        (function() {
            const mid = w_done;
            const current = frame + 1 - n_done;
            let right = 100;
            let bottom = 100;
            let w,h;
            let r1,r2;
            let move;
            let look1 = [0,0];
            let look2 = [0,0];
            if(current==0) { 
                move = 'squish left';
                // squish left
                r1 = 100;
                r2 = 100*n_done/(n_done+1);
                right = lerp(r1,r2,dt);
                cell(frame+1,right,0,100-right,100,[right,0,100-right,100],[0,0,right,100]);
                look1 = [100-100/w_done, 100-100/w_done, 100/w_done, 100/w_done];
                look2 = [right,0,100-right,100];
            } else if(current<mid) {
                move = 'add right';
                // add to right
                r1 = 100*n_done/(n_done+current);
                r2 = 100*n_done/(n_done+current+1);
                right = lerp(r1,r2,dt);
                const rbottom = lerp(100, 100-100/(current+1), dt);
                h = rbottom/(current)
                for(let y=0;y<current;y++) {
                    cell(n_done+y,right,h*y,100-right,h,y==current-1 ? y==0 ? [0,0,right,100] : [right,h*(y-1),100-right,h] : [right,h*(y+1),100-right,h],[right,rbottom,100-right,100-rbottom]);
                }
                cell(n_done+current,right,rbottom,100-right,100-rbottom,[right,rbottom,100-right,100-rbottom],[right,0,100-right,rbottom]);
                look1 = [right,h*(current-1),100-right,h];
                look2 = [right,rbottom,100-right,100-rbottom];
            } else if(current==mid) {
                move = 'squish up';
                // squish up
                right = 100*n_done/(n_done+mid);
                r1 = 100;
                r2 = 100*(n_done+mid)/(n_done+mid+1);
                bottom = lerp(r1,r2,dt);
                h = bottom/mid;
                for(let y=0;y<mid;y++) {
                    cell(n_done+y,right,y*h,100-right,h,y==mid-1 ? y>0 ? [right,0,100-right,(y-1)*h] : [0,0,right,100] : [right,(mid-1)*h,100-right,h],[0,bottom,100,100-bottom]);
                }
                cell(n_done+mid,0,bottom,100,100-bottom,[0,bottom,100,100-bottom],[0,0,100,bottom]);
                look1 = [right,(mid-1)*h,100-right,h];
                look2 = [0,bottom,100,100-bottom];
            } else {
                move = 'add bottom';
                // add to bottom
                r1 = 100*(n_done+mid)/(n_done+current);
                r2 = 100*(n_done+mid)/(n_done+current+1);
                bottom = lerp(r1,r2,dt);
                right = 100*n_done/(n_done+mid);
                h = bottom/mid;
                const bright = lerp(100, 100-100/(current-mid+1), dt);
                w = bright/(current-mid);
                for(let y=0;y<mid;y++) {
                    cell(n_done+y,right,y*h,100-right,h,[0,bottom,100,100-bottom],[bright,bottom,100-bright,100-bottom]);
                }
                for(let x=0;x<current-mid;x++) {
                    cell(n_done+w_done+x,w*x,bottom,w,100-bottom,x==current-1-mid ? x==0 ? [0,0,100,bottom] : [w*(x-1),bottom,w,100-bottom] : [w*(x+1),bottom,w,100-bottom],[bright,bottom,100-bright,100-bottom]);
                }
                cell(n_done+current,bright,bottom,100-bright,100-bottom,[bright,bottom,100-bright,100-bottom],[0,bottom,100,100-bottom]);
                look1 = [w*(current-mid-1),bottom,w,100-bottom];
                look2 = [bright,bottom,100-bright,100-bottom];
            }

            let sx = 0;
            let sy = 0;
            w = right/w_done;
            h = bottom/w_done;
            let down = false;
            let s = 0;
            let nn = 0;
            while(s<w_done) {
                const slook1 = current==0 && sx==w_done-1 && sy==w_done-1 ? [100-2*w,100-h,w,h] : look1;
                cell(nn,sx*w,sy*h,w,h,frame==0 ? [0,100,100,100] : slook1,look2);
                if(down) {
                    sy += 1;
                    if(sy==s) {
                        sx = 0;
                        down = !down;
                    }
                } else {
                    sx += 1;
                    if(sx==s+1) {
                        s += 1;
                        sy = 0;
                        down = !down;
                    }
                }
                nn += 1;
            }
        })();
    }
}

animate({
    draw: draw,
    runtime: CELLS,
    fps: 60,
    size: 1000,
    makemovie: true
});

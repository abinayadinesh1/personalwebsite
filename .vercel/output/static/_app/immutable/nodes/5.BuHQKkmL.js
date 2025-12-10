import{s as i,n as s}from"../chunks/Ci_zxSXj.js";import{S as a,i as l,d as c,t as d,a as h,m as p,c as u,b as m}from"../chunks/BlG282hF.js";import{S as f}from"../chunks/A-LUeCcg.js";function w(r){let o,e;return o=new f({props:{source:r[0]}}),{c(){m(o.$$.fragment)},l(t){u(o.$$.fragment,t)},m(t,n){p(o,t,n),e=!0},p:s,i(t){e||(h(o.$$.fragment,t),e=!0)},o(t){d(o.$$.fragment,t),e=!1},d(t){c(o,t)}}}function g(r){return[`

# introvert bot

I flew across the country for two days to build microbots with my friends. 

### Project Description:

With the release of Carl Bugeja’s penny-sized [codecells](https://microbots.io/products/codecell?srsltid=AfmBOoru9usWntmHmdrsvQdLJ1z-plgWL1feEu-BPRgsevfjh9zjJCJQ&variant=49714638717261) and [drivecells](https://microbots.io/products/drivecell), we tried to build a tiny mobile robot which ran away from the light: essentially, an introvert bot. The specs for this were quite simple: 1) connect the motors to the drivcell and the codecell 2) hook up photoresistors at opposite ends of the bot 3) write a script for the bot to move in the opposite direction of the brightest light source.

v0 v1

Final Design:

[insert image of the cad file and bot itself]

### Learned:

- How to work with limited space on the board (literally running out of pins to connect our sensors to)
    - Introducing concepts like Charlieplexing/multiplexing
- How to solder tiny tiny components
- How to use a proto board!
- How to manually reset a board (by short circuiting it)

### Challenges:

After about 18 hours, we ran a bug that read: “A fatal error occurred: Unable to verify flash chip connection (No serial data received.” The only way to fix it was to mechanically reset the board, by connect the SLC and GND pins to each other and supplying power. However, this would only work temporarily, which made it really hard to upload new code to the board. We were stuck with the motors spinning at ‘forward’ for hours trying to load new code on. 

### Outcome:

We ended up with a script to move the bot in all directors and for it to autonomously move in the direction of least light. It had 2 wheels and 3 photoresistors, meaning it would go backwards, right or left depending on the photoresistor data. We also CAD’ed and assembled the robo, polishing off the wiring by mounting the cables and sensors onto a protoboard. 

---
    `]}class $ extends a{constructor(o){super(),l(this,o,g,w,i,{})}}export{$ as component};

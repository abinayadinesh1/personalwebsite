import{s as i,n as r}from"../chunks/scheduler.Cu-e96pa.js";import{S as s,i as l,c,a as u,m as d,t as m,b as h,d as f}from"../chunks/index.DvinRJN7.js";import{S as y}from"../chunks/SvelteMarkdown.B2H9SMJi.js";function g(a){let t,e;return t=new y({props:{source:a[0]}}),{c(){c(t.$$.fragment)},l(o){u(t.$$.fragment,o)},m(o,n){d(t,o,n),e=!0},p:r,i(o){e||(m(t.$$.fragment,o),e=!0)},o(o){h(t.$$.fragment,o),e=!1},d(o){f(t,o)}}}function k(a){return[`
# [Underactuated Robotics](https://underactuated.csail.mit.edu/) by Russ Tedrake

## lect 1
### robot dynamics
agility robotics
boston dynamics
toyota
ANYbotics      

this class is about making atlas dance! 
1. computer vision 
2. llm's
3. foundation models

### 3 examples 
<mark style="background: #FFB86CA6;">atlas control system</mark> doesn't use much learning, mostly online planning with newtons equations of motion
	more of a physics based model
with bipeds

<mark style="background: #FFB86CA6;">ANYmal</mark> uses a lot more learning - the reinforcement learning success story 
	- great when terrain gets dicey and there's a lot of uncertainty in the world
	- more like pure learning
	

with quadrapeds - BD and unitree have a light distal mass: light legs and big actuators at the hips means **u can use your legs arbitrarily fast**

<mark style="background: #FFB86CA6;">Manipulation</mark> - imitation learning works best rn for dexterous manipulation

tesla's biped looks like a ZNP policy, not a RL policy

robot that 'likes' a page of a book and can flip to that page (knows if it is to the right or left)

We're gonna talk a lot about dynamics and control! Optimization based view of Control, then ML based view of control 


Actions
	motor torque commands
<mark style="background: #FFF3A3A6;">Environment</mark>
	also called a <mark style="background: #FFF3A3A6;">PLANT</mark>
	has the robot and its surroundings included
Output: Observations
	joint position measurements
	contact load sensors 
	cameras

Goal is to build a controller (or a policy) that 
	does the other half: takes the environment and the observations and helps build actions


The strength of RL is that you have to make very minimal assumptions about the environment 


What makes control challenging (or rich)? 
- uncertain, noisy, or insufficient observations (partial observability)
	- questions about <mark style="background: #BBFABBA6;">observability</mark>
	- this is more taught in a <mark style="background: #FFF3A3A6;">state estimation or perception class</mark>
- dynamics: if your actions have **long term consequences**
	- an action you took changing the system multiple time steps later
	- questions about <mark style="background: #BBFABBA6;">controllability</mark>
We can have nonlinear generalizations of both. 
- nonlinear dynamics or observations
	- sometimes high dimensionality. what gets better with higher dimensions? 
	- higher dimensions - defined as lots of states in a state space model or lots of actions
We focus on the more dynamics questions 


### Nonlinear Differential Equations! 
our tools are mostly numerical 

this is our dynamics model
$dot{x} = f(x, u)$
	x - state vector
	u - control input 
	f - a vector valued function
	$dot{x}$ - time derivative of x (how does x change)

later we'll add an observation model 
y = g(x)
	y - vector of observations



#### Linear differential equation
a subset, where the input is linear
$dot{x} = Ax + Bu$

For Mechanical Systems
	they are *second order* - F = ma
	$dot{dot{q}} = f(q, dot{q}, u)$
		q - position (joint angle of robo)
		 $dot{q}$ - velocity (motor torque)
		 $dot{dot{q}}$ - joint accelerations
		 u - control 

"control affine nonlinear systems"
the way $u$ enters the equation is limited
if $u$ is a torque, 	$dot{dot{q}} = f_{1}(q, dot{q}) + f_{2}(q, dot{q})u$
	u can only affect in an affine way
	linear is the part with u + a constant


dim(q) = m
dim(u) = n

(1) $dot{dot{q}} = f_{1}(q, dot{q}) + f_{2}(q, dot{q})u$

DEFINITION::::: (1) is <mark style="background: #D2B3FFA6;">**fully actuated**</mark> in $(q, dot{q})$ iff $f_{2}(q, dot{q})$ is <mark style="background: #FFF3A3A6;">full row rank</mark>
	if it is full row rank, it has a right inverse

This is a question of: <mark style="background: #BBFABBA6;">can you instantaneously cause an acceleration</mark>? 

DEFINITION::::: (1) (the state) is **<mark style="background: #D2B3FFA6;">**underactuated**</mark>** in $(q, dot{q})$ iff $rank[f_{2}(q, dot{q})] < m$ 
The SYSTEM is underactuated if this holds for all $q, dot{q}$ (input position and velocity)



#### Feedback Equivalence to a double integrator
why is the system fully actuated if $dot{dot{q}} = f_{1}(q, dot{q}) + f_{2}(q, dot{q})u$ has a right inverse?

Given: $dot{dot{q}}^{d}$ -> trying to achieve acceleration $d$
	Then: $u = f_2^{-1}(q, dot{q})[dot{dot{q}}^{d} - f_1(q, dot{q})]$


<mark style="background: #FF5582A6;">Why is it that having a lot of motors on a robot would mean that the dynamics gets erased, and you can write it as this double integrator?</mark>
	with enough motors, you can actually just make it do whatever you want. you can cancel momentum in a certain direction. 
	important: this is what limited robotics for a really long time. 


Can BREAK feedback equivalence if there are restrictions:
	<mark style="background: #FFF3A3A6;">input saturation</mark>: can't apply a torque to a motor outside of an accepted range
		technically underactuated
	<mark style="background: #FFF3A3A6;">state constraints</mark>: world won't let you make a motion where you pass through the ground
		holonomic or non holonomic
	<mark style="background: #FFF3A3A6;">model uncertainty</mark> - complicated, but can use adaptive control 


previously, walking robots were built like two robot arms, where at least one is bolted to the floor at any time. 


#### Manipulator Equations
main form for rigid body mechanics: 
$M(q)dot{dot{q}} + C(q, dot{q})dot{q} = 	au_{g}(q) + Bu$

$C(q, dot{q})$ - coriolis terms
M(q) - mass matrix 
$	au_g$ - gravity term (torque due to gravity)
 u - torque input 
B - actuation selector matrix
	- if B is full row rank, there is an actuator for every motor, it is fully actuated
	- when B is low rank, control actions have longer term consequences

q - position (joint angle of robo)
 $dot{q}$ - velocity (motor torque)
 $dot{dot{q}}$ - joint accelerations

![[Screenshot 2025-01-11 at 7.39.49 PM.png]]

stall fluid [dynamics]() - 

`]}class $ extends s{constructor(t){super(),l(this,t,k,g,i,{})}}export{$ as component};

<script>
    import SvelteMarkdown from 'svelte-markdown'
    const source = `

# Problem Solving at Seneca 🔐

**Before you read:** this is meant to be a fun depiction of what problem solving felt like at a very early stage startup building very large autonomous drones for firefighting (https://seneca.com/). There are lessons to learn from my experiences, but in no way were our processes always optimal or best. The point is: how did we address problems when they came up?

In order of events:

## Project 1 (~6 weeks)

**Problem statement:** Our motors currently receive messages from our flight computer (ARK Pab Jetson) in terms of PWM commands. This enables us to send commands in one direction, but we have no insight into if the command is being received by the ESC, decoded properly, and what effect that has on the motors themselves (in terms of temperature, current, voltage).

**Goal:** Revamp our motor communication stack to talk over DroneCAN (a child of CAN), instead of PWM.

**Outcome:** Got functional bidirectional communication for motors from 3 different vendors, which all needed custom implementations: TMotor, HobbyWing, and MadMotors. Built a subscale drone to test motor comms + logging. Got it deployed and flying on full-scale version within the 6 weeks. Over the next 3 months, we benefitted immensely from being able to see real time logs of ESC current, voltage, and temperature, and if/when the drone crashes, we can pull logs off of the flight computer (through the Jetson) to look at how intended commands correlated with spikes in the current. When one motor acts up in nuanced ways over time, we have the exact data of how/when that happened, and can relate it to seemingly uncorrelated problems elsewhere in the stack.

**Process:**

This project need not have taken 6 weeks, but we struggled to consistently source motor vendors that could keep up with our demand for power, torque, and cost. Specifically, weeks after the T-Motor implementation was complete, they became banned in a trade embargo, and we had to switch to Mad Motor. Similarly, weeks after the Mad Motor implementation was working and flying, they defaulted on a large order for motors we made that was necessary for an upcoming demo. So we switched to Hobbywing.

Why did it take so much work when we switched between vendors? Ardupilot (our flight control firmware) does a fairly good job of abstracting motor level information from us. But, rarely do the same set of parameters simply plug and play when you change the underlying hardware. So, for each vendor, I would have to figure out how they talk to the motors through the ESC's, often having a 1-page datasheet to go off of, some sort of vendor specific software written in Chinese that only works on a specific version of Windows with certain drivers installed, and a few USB-CAN modules to try to redirect information from the ESC's in a way that I could interpret it. I ended up loving DroneCAN GUI's open source software, but it only worked once you got the parameters correct on the flight software. In the meantime, it would take careful, precise, and rigorous experimentation to decode what the ESC was saying, and eventually write different node id's to the ESC's so we could demultiplex them for the flight computer. All in all, a new and fun set of challenges!

Before I considered the project complete, I documented steps on how to reproduce my work for each of the motors in 'Guru Cards', which our engineers rarely used at Seneca, but I loved to keep track of reusable processes. Moreover, I made a script to automatically flash parameters onto each Jetson so our flight-test team wouldn't have to use multiple laptops, GUI's, and notes to piece things together. This overall reduced the time it takes to get a new drone off the press flying and makes each flight safer.

## Project 2 (~6 weeks)

**Goal:** Our customers kept demanding a speaker system that would keep their crew and any bystanders at the fire site safe while our high powered drone was stationed on the ground, taking off, or landing. This needed to be loud enough to cut through any ambient noise, and customizable for future use cases.

**Outcome:** A mono-speaker system with very low power requirements that could reach 110db at 1m and effectively transmit speech audio with high fidelity without unpleasant audio artifacts.

**Process:**

1. To make headway as fast as possible, we tried to find a simple off the shelf speaker that could do the job for us. Our first selection criteria was size, so we simply ordered speakers from Amazon (think office speakers) and benchmarked how loud they could get. We quickly realized they wouldn't be loud enough.

2. In the same vein, we wondered if having 2 synced speakers would help us get more volume than 1. So we tested 2 Bose Soundcore Mini's over wired connection, which at first analysis, seemed to beat all the previous speakers in volume. It peaked around 95db.
   
   a. One mistake we made during the testing in this phase was testing indoors/near the office. The obvious noise disturbance to blasting drone sounds made us shy away from actually testing the speakers at max capacity with enough repetitions. This made it difficult for us to catch other issues earlier on:
      - For example, we didn't notice that the DAC splitter (USB to two audio jacks), also split the signal between the two outputs. So, when we drove the speakers at max volume from the Jetson, each speaker was only receiving half the amplitude of the signal.
      - As another example, we didn't catch how little of a difference 2 speakers made vs one. It was louder, but because decibels are on a logarithmic scale, it didn't push us much closer towards our 110db requirement. Sound is not intuitively additive. 95db + 95db is only 98db. This is obvious when you write out the math, but it was a step we naively skipped because there was no doubt that 2 speakers would be louder than 1.
   
   b. **Solution:** We should've brought the speakers to our test range within the first few days of getting hold of the speakers so we could qualitatively tell if the speakers worked in a wide open field and at long distances (similar to where our customers would be deploying). This setup did not.

3. Once we realized the 2 synced speakers still wouldn't cut it, we had to shift our framework away from what was available off the shelf at the size we wanted and look more at the driver level. Our requirements were this: the full device must be < 250g, output at least 110db, transmit signal over wired connection (no bluetooth), and small (at the scale of a hand).
   
   a. This launched a process of me taking our requirements, and backtracking to hardware that would meet them. I ended up learning a lot about how speakers worked: how diaphragm material, magnet material, horn geometries, and the input frequency spectrum impacted the overall output. Yet, it was still overall unfruitful.
   
   b. One fun experience in this process was purchasing speaker modules and disassembling them to understand how they got their volume. We took apart a DJI Mavic speaker which was tiny, and reported 110db on their spec. After stripping through all their packaging (plastic housing, pcbs, hardware), we got to the speaker driver which was only 2x as big as a quarter. Impeccable. There was a serial number on the back, that we tried to track to a manufacturer online. But, there were no immediate results. My TPM had the idea of searching a subset of the serial number (the first 3 letters) and this was a hit. We found the speaker manufacturer in China that DJI bought from. Still, with a full search through their catalog, there was nothing that matched the specs of the driver I was holding in my hand. It became clear that DJI got a custom part from them that they weren't looking to share with others. For our lead time requirements, this path wouldn't work for us.
   
   c. As you might expect, our requirements were too tight to find what we needed. We needed to relax them to find what we actually needed.

4. Finally, we had the thought to change what we were searching for. Our first priority was volume. So instead of looking for something with the right weight, dimension, connection type, and magnet material, why don't we just look for a speaker that can handle a lot of watts? Watts correlates with power, which corresponds to volume. This was an instant hit.
   
   a. There are lots of results for speakers (made in the US) that can drive 100, 250, … watts. Now, it's easy to pick the one that matched our other requirements while being sure it could physically obtain the right volume.

5. With this out of the way, actual software integration with our flight control stack took 1% of the time. I first implemented it when our entire codebase was written in asynchronous python control loops, then reimplemented it as a custom ROS2 node when we switched over.

## Project 3 (~6 weeks)

**Goal:** Don't let the drone crash into anything. Our biggest priorities were: power lines, trees/branches, and buildings. For the scope of this project, we cared about static obstacles that wouldn't be mapped anywhere. So tall trees, but not birds.

**Outcome:** [To be completed]

**Process:** [To be completed]

---

## What I wished went better from my experience at Seneca:

- I wish I got more time to write code! I joined when our company was only 15 people, so all of the projects I took on had zero headway until I worked on them. This meant I needed to take hold of the full stack, from component selection to testing, integration, and deployment. Obviously, I'm not a hardware engineer, so some of my efforts could've been done faster if someone with the right background was working on it. Regardless, I'm grateful for everything I got to learn in the process and 2/3 of the projects were in mature deployment by the time I left, with the camera project working on the drone but still going through R&D.

- Wish requirements were more clear at the front of a project, instead of finding out as you go. As a minimal example: knowing what the target Hz our obstacle avoidance needed to be, given a drone speed. Every downstream choice is impacted by this requirement, and unclear requirements make it difficult to benchmark progress.
`

</script>


<SvelteMarkdown {source} />

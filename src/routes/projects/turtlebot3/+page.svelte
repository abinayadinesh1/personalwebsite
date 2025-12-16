<script>
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import ProjectEditor from '$lib/components/ProjectEditor.svelte';
  import { getProjectStatus } from '$lib/utils/projectStatus.js';
  import SvelteMarkdown from 'svelte-markdown';

  let showEditor = true;

  const turtlebot3Content = `# turtlebot3

Over the summer, I worked at a company called farm-ng building autonomous rovers for farms. They started out relying on GPS data and waypoint-finding to preset locations to navigate through fields, but the time needed to collect a high resolution GPS information really bogged down our speed of delivery. Towards the end of my internship, we started exploring visual navigation system for GPS denied navigation, so I wanted to build my own hardware kit to fully understand how to build and deploy a visual navigation system that works for outdoor environments. 

## The hardware

I chose a [turtlebot3 hamburger](https://www.robotis.us/turtlebot-3-burger-us/?srsltid=AfmBOoqoCrjcskoLButeEA43UUsbKC9RUHWveAYs-G5QZeENih9KMkq8) to act as the mobile base because, from the docs and its frequent usage in robotics labs, I figured it would be the easiest to setup and develop with. Despite its wide support for different ros environments, hardware (from raspberry pi to jetson nano), and modifications, I quickly realized how different the developer expectations were from hardware to software. 

Timeline: 

**June 27 - Assembly (3-4 hours)**

Assembly followed clearly from the manual, and the result looked quite like a burger. I later realized that lidar was the most expensive part of the kit (350$) and the only part of the stack which I *didn't* need. 

<img src="/turtlebot_pic.png" alt="Description" width="25%" />

Since I didn't want the navigation of this bot to rely on sensed geometric structure coming from the lidar, I tried removing it from the stack and replacing it with a camera. To my dismay, **this kit will not work if any of the starting components are missing.** Even though, as a engineer, you know the motors will work regardless of if the lidar is connected, the built-in startup node will fail if the lidar is missing. This meant the top layer of the bot was essentially useless to me, and later inspired me to make a [mobile base from scratch without the lidar](https://www.notion.so/mobile-base-w-programmable-sdk-143935f751838039a0e6ec5a8df14e02?pvs=21). 

**July through August - Installing Ubuntu + ROS**

I wish I could count the time this took in hours or days, but it took more like weeks to do anything intelligent with this stack. Here is a nonexhaustive list of some issues I faced and solved along the way. 

1.  Problem: Raspberry Pi 4 does not support ROS Kinetic. 
    1. This frustrated me because *the first instruction is how to use an RPI with ROS Kinetic. bruh.* 
    2. I just switched to ROS Humble. 
2. Problem: It is basically impossible to install ROS on a Mac, or to boot Ubuntu on a Mac. 
    1. I experimented with lots of Virtual Machines and Emulators that would have the full functionality of Ubuntu 22.04 on my Mac, and landed on the paid version of [Parallels Desktop](https://www.notion.so/projects-142935f751838036b228e65c6505ac8b?pvs=21). I highly recommend it. 
3. Problem: Installing ROS on a Raspberry Pi is so slow (6-8 hours) and would often result in a very weird outdated dependency error that would cancel the whole process. 
    1. Solution: Lots of trial and error with different venvs + checking Robotis forums for help. 
4. Problem: Sshing into the RPI (with a headless config and Ubuntu OS) was really hard the first time. 
    1. I tried enabling password-based ssh, but it still denied me entry using only the password. I had to trace the logs to find the files that were made to control the ssh settings and then found one which kept passwordEnabled set to false, even after overriding it. Manually setting this fixed the problem! 

New things I learned: 

- how to install ROS on a virtual machine + RPI
- how to partition a disk + how NOT to
- how to debug lidar firmware
- how to fry a board
- how RPI networking works
- different ros packages are only be available for different computers, different turtlebot software are only compatible with certain ros versions, and there is a very small intersection of what actually works on your hardware + architecture

**August!** 

I finally [got teleoperation working on the turtlebot](https://x.com/abinayaaaa/status/1832487991400657321)!!!!! This was a huge unlock to being able to control it + start developing maps for navigation. In the meantime, I spent a lot of time reading work done in Sergey Levine's lab, spearheaded by Dhruv Shah, for an overview into the different levels of visual navigation: 

[Vision Based Kilometer Scale Navigation with Geographic Hints](https://sites.google.com/view/viking-release)

One of the best outcomes of this paper is being able to supple a high level diagram of the space as navigational heuristic for the robot, similar to the ones below:

<img src="/lelan_pic.png" alt="Description" width="25%" />

I can easily see this being used on new fields or farms: draw up the overall structure of the farm and its boundaries so the robot can 'know what to expect' without explicit boundary configuration or high resolution aerial imaging. 

[NoMaD - Goal Masking Diffusion Policies for Navigation and Exploration](https://general-navigation-models.github.io/nomad/index.html)

[LeLaN: Learning A Language-Conditioned Navigation Policy from In-the-Wild Videos](https://arxiv.org/abs/2410.03603)

One of the biggest outcomes of this was coming up with an pipeline for taking real-world, egocentric video data and automatically annotating it with robot action sequences so they can be used to train mobile robots (the predicition of action sequences came from NoMaD). This worked extremely well for outdoor environments: for example, it helped teach the robot what materials were 'traversible' (like tall grass) from 'not traversible' (like the side of a green building), which would be much harder to do with a smaller dataset or only geometric input. This paper is the basis for my visual navigation implementation, but it also uncovered a [deep gap in the amount of publicly available egocentric data there was for farms](https://www.notion.so/collecting-egocentric-data-on-farmland-with-a-tiny-rover-143935f7518380ec9573dd8f00df731e?pvs=21), limiting our abilities to use data to improve robotic navigation in these environments.

**September - Programming the turtlebot at [Founders Inc Horizon, SF](https://lu.ma/horizon-sf) !**

I took my turtlebot stack to a hardware hackathon at founders inc, where I got to pair with an awesome team to make this mobile base into a friendly robot for homes. Our goal was to be able to 1) take in commands via voice, 2) Mount an arm to the back of the robot so it can pick up items, and 3) use a simple object detection algorithm to navigate the base to an object of interest. 

<img src="/polaroid_pic.png" alt="Description" width="25%" />

i love using dremels!

### Closure

We ended up developing 3) the algorithm for goal-directed navigation and 1), the pipeline for converting data from the microphone into a task for the robot. The main challenge was finding out towards the end of our hackathon that most of our motors were non functional, including the ones on the turtlebot3. We're still not sure when/how they broke, especially given that all the software (for teleop, slam) is still working, but this further influenced my shift to [building a mobile base from scratch](https://www.notion.so/mobile-base-w-programmable-sdk-143935f751838039a0e6ec5a8df14e02?pvs=21) with off the shelf parts that I could individually test and debug, instead of the turtlebot stack.`;

  const defaultProjects = [
    { id: 'writing', title: 'writing', path: '/projects/writing_ideas', lastUpdated: '2025-12-13', status: 'In Progress', hasCommits: true, isPublic: false },
    { id: 'pcb 1', title: 'haptic motor controller (pcb)', path: '/projects/eagelmann-vest-pcb', lastUpdated: '2025-04-17', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'turtlebot3', title: 'Visual Navigation with Turtlebot3', path: '/projects/turtlebot3', lastUpdated: '2024-09-15', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'tinybots', title: 'Playing with micro-micro-controllers', path: '/projects/tinybots', lastUpdated: '2024-08-20', status: 'Graduated', hasCommits: true, isPublic: true },
    { id: 'bracketbots', title: "Building a 'wifey' bot", path: '/projects/bracketbots', lastUpdated: '2024-10-10', status: 'Graduated', hasCommits: true, isPublic: true }
  ];

  onMount(() => {
    if (browser) {
      const { showEditor: shouldShowEditor } = getProjectStatus('turtlebot3', defaultProjects);
      showEditor = shouldShowEditor;
    }
  });
</script>

{#if showEditor}
  <ProjectEditor projectId="turtlebot3" isAdmin={false} />
{:else}
  <div class="graduated-project-content">
    <SvelteMarkdown source={turtlebot3Content} />
  </div>
{/if}

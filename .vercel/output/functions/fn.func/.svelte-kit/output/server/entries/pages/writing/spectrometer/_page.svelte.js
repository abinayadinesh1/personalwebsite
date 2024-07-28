import { c as create_ssr_component } from "../../../../chunks/ssr.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<hr> <p data-svelte-h="svelte-1hzomkd">title: Inside a spectrometer subtitle: diff types, how to build one, use cases
  + more</p> <h2 id="date-07-22" data-svelte-h="svelte-e4g06v">date: 07/22</h2> <h1 id="intro" data-svelte-h="svelte-1hx3ngc">intro</h1> <p data-svelte-h="svelte-e4php2">used to measure the composition (chemical) of a particle</p> <p data-svelte-h="svelte-tsn8ki">we are splitting electromagnetic radiation into its individual wavelengths</p> <h2 id="background" data-svelte-h="svelte-m2xqpi">background</h2> <p data-svelte-h="svelte-fhmwua">an electromagnetic spectrum is made up of electromagnetic radiation, with
  varying frequency. each frequency has an associate wavelength, which has its
  own photon energy.</p> <p data-svelte-h="svelte-rx1rit">which section of a electromagnetic spectrum does spectroscopy work on?</p> <p data-svelte-h="svelte-ic1urg">the electromagnetic spectrum can be organized by defining specific frequency
  ranges as bands that correlate to how those waves are produced, interact with
  matter, and are formed. this is what we see as <a href="https://en.wikipedia.org/wiki/Radio_wave">radio waves</a>, <a href="https://en.wikipedia.org/wiki/Microwave">microwaves</a>,
  <a href="https://en.wikipedia.org/wiki/Infrared">infrared</a>,
  <a href="https://en.wikipedia.org/wiki/Visible_light">visible light</a>,
  <a href="https://en.wikipedia.org/wiki/Ultraviolet">ultraviolet</a>,
  <a href="https://en.wikipedia.org/wiki/X-ray">X-rays</a>, and
  <a href="https://en.wikipedia.org/wiki/Gamma_ray">gamma rays</a> <img src="https://res.cloudinary.com/djp21wtxm/image/upload/v1690167289/i612x375-RIFMv9XEbrou_rreove.png" alt=""></p> <p data-svelte-h="svelte-jzsquy">energy - photons used for work ? wavelength is actually based on frequency.</p> <p data-svelte-h="svelte-sswvt9">what has energy here? what is electromagnetic radiation?</p> <p data-svelte-h="svelte-u16icp">the electromagnetic FIELD (not spectrum anymore) is made up of waves with
  specific characteristics, like being able to propogate freely in space without
  needing added input (also why its called the far field, it can move a great
  distance away from the source that produced it). they carry momentum and
  electromagnetic radiant energy.</p> <p data-svelte-h="svelte-1lv1e81">light is both a particle and a wave</p> <h1 id="types" data-svelte-h="svelte-1cq5c5m">types</h1> <ul data-svelte-h="svelte-1cs7bu7"><li>mass spec - takes a gas and is able to measure the spectrum of masses of all
    the gases/particles
    <ul><li>tells you the <strong>mass to charge ratio of ions</strong> which allows
        you to know exactly what the chemical composition is of what you are looking
        at</li></ul></li> <li>optical spectrometer - is able to separate the unique wavelengths that make
    up visible light
    <ul><li>can only work on specific sections of the electromagnetic spectrum
        (probably the part to the right and left of the visible spectrum)</li> <li>different wavelengths of light are separated by <a href="https://en.wikipedia.org/wiki/Refraction">refraction</a>
        in a <a href="https://en.wikipedia.org/wiki/Prism_(optics">prism</a>) or
        by <a href="https://en.wikipedia.org/wiki/Diffraction">diffraction</a>
        by a
        <a href="https://en.wikipedia.org/wiki/Diffraction_grating">diffraction grating</a></li> <li>apparently what you are actually measuring is the irradiance (intensity)
        or polarization state</li> <li>includes infrared</li></ul></li> <li>nmr</li> <li>raman spectroscopy and infrared spectroscopy are often used in conjunction
    <ul><li>uses a beam of light (like a laser) to excite a bunch of photons and
        create raman scattering</li> <li>how much the resulting photons shift up or down decides what the
        chemical bonds in the sample are</li></ul></li></ul> <p data-svelte-h="svelte-1k0yy2s"><img src="innards%20of%20a%20spectrometer%20e22f524b6ec3429a8d0e281e541a03c3/web.png.gif" alt="web.png.gif"></p> <h2 id="collecting-evidence" data-svelte-h="svelte-m6ry2l">Collecting evidence</h2> <p data-svelte-h="svelte-18qv44e"><a href="https://hubblesite.org/contents/articles/spectroscopy-reading-the-rainbow">https://hubblesite.org/contents/articles/spectroscopy-reading-the-rainbow</a> fun article from hubble space</p> <p data-svelte-h="svelte-v255gp"><a href="https://www.instructables.com/DIY-Low-Cost-Spectrometer/">https://www.instructables.com/DIY-Low-Cost-Spectrometer/</a></p> <ul data-svelte-h="svelte-1kpm6ig"><li>doable</li> <li>visible light spectrum</li></ul> <p data-svelte-h="svelte-bhmtz0">how this worked:</p> <p data-svelte-h="svelte-117z3pq">make a completely black box (to absorb any light not coming from the light
  source)</p> <p data-svelte-h="svelte-ezvdac">make a box with a tiny slit in the front for which light can enter from</p> <p data-svelte-h="svelte-iodwih">put a webcam in the box and connect it to a camera, place a diffraction
  grating on it (like a cd) which takes light and diffracts it based on the
  wavelength</p> <p data-svelte-h="svelte-w36yjh">shine light into the box, it will hit the diffraction grating and scatter into
  individual wavelengths of EMR which will show up in the image the webcam
  produces.</p> <p data-svelte-h="svelte-11mldul">you convert the image into wavelengths using opencv + a simple script
  (attached)</p> <p data-svelte-h="svelte-1wh7yov">to look at the wavelengths/compositions of certain media, can pass it through
  a clear box of that liquid</p> <p data-svelte-h="svelte-19ju79l"><a href="http://engineering.nyu.edu/gk12/amps-cbri/pdf/visible_light_spectrophotometer.pdf">http://engineering.nyu.edu/gk12/amps-cbri/pdf/visible_light_spectrophotometer.pdf</a></p> <ul data-svelte-h="svelte-1g9lsw0"><li>spectrophotometer from NYU</li></ul> <p data-svelte-h="svelte-1gpxkbb">near-IR spectrometer</p> <p data-svelte-h="svelte-hllgkk"><a href="https://caoyuan.scripts.mit.edu/ir_spec.html">https://caoyuan.scripts.mit.edu/ir_spec.html</a> goated af</p> <p data-svelte-h="svelte-1p4xl13"><a href="https://physicscourses.colorado.edu/phys4430/phys4430_fa18/Labs/Build%20a%20spectrometer%20v2.pdf">https://physicscourses.colorado.edu/phys4430/phys4430_fa18/Labs/Build a
    spectrometer v2.pdf</a> requires materials that i dont have but great intro to diffraction grating</p> <p data-svelte-h="svelte-zv5agn">measure chemical composition of air</p> <p data-svelte-h="svelte-i3nfwv">when you are trying to measure things you cant see on the visible eye, you
  have to use something longer or shorter to fix the wavelength.</p> <p data-svelte-h="svelte-1x1n6uq">a visible light beam (like a laser) will still interact with the particles,
  but only ones within a specific frequency range. <strong>ER source and particle you are looking for must be in the same frequency
    range?</strong></p> <p data-svelte-h="svelte-1w6l3mv">do diffraction graters differ depending on the light source and sample?</p> <p data-svelte-h="svelte-zd5gnl">GREENHOUSE GASES (characteristically) ABSORB INFRARED. they trap heat energy
  that would otherwise leave as infrared light.</p> <p data-svelte-h="svelte-hjwupp"><strong>greenhouse gases take infrared light emitted as a result of chemical
    reactions and absorb it, keeping heat in the atmosphere that otherwise would
    have left.</strong></p> <p data-svelte-h="svelte-1jnw3uv">infrared working group at NCAR: <a href="https://www2.acom.ucar.edu/irwg">https://www2.acom.ucar.edu/irwg</a></p> <p data-svelte-h="svelte-s3ht3t">network for the detection of atmospheric composition change:</p> <p data-svelte-h="svelte-iild1o">Lidar, which stands for Light Detection and Ranging, is a remote sensing
  method that uses light in the form of a pulsed laser to measure <strong>ranges (variable distances) to the Earth</strong>.</p> <p data-svelte-h="svelte-3eeosh">used to tell distance from source</p> <p data-svelte-h="svelte-1pxfryj">FTIR spectroscopy is very optimal method of analyzing IR light</p> <p data-svelte-h="svelte-1fcduem">cool guy at nasa, official <a href="https://ndacc.larc.nasa.gov/instruments/ftir-spectrometer">https://ndacc.larc.nasa.gov/instruments/ftir-spectrometer</a></p> <p data-svelte-h="svelte-ro8wyx"><a href="https://airbornescience.nasa.gov/person/Gao_Chen">https://airbornescience.nasa.gov/person/Gao_Chen</a></p> <p data-svelte-h="svelte-wz9zlu"><a href="https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Supplemental_Modules_(Physical_and_Theoretical_Chemistry">how ftir operates</a>/Spectroscopy/Vibrational_Spectroscopy/Infrared_Spectroscopy/How_an_FTIR_Spectrometer_Operates)</p> <p data-svelte-h="svelte-1i1gk9l">Jesse Kroll - atmospheric composition at mit</p> <p data-svelte-h="svelte-19gi7jx"><a href="https://climate.mit.edu/users/mit-department-earth-atmospheric-and-planetary-sciences">https://climate.mit.edu/users/mit-department-earth-atmospheric-and-planetary-sciences</a></p> <p data-svelte-h="svelte-18a22c7"><a href="https://climate.mit.edu/users/mit-joint-program-science-and-policy-global-change">https://climate.mit.edu/users/mit-joint-program-science-and-policy-global-change</a></p> <p data-svelte-h="svelte-1igyb98">agriculture, climate</p> <p data-svelte-h="svelte-8zk21r">how much carbon is ur farm sequestering? low quality because we dont know what
  form/how long. we only know flux.</p> <p data-svelte-h="svelte-6swy4y">better way to measure is by sampling for carbon in the soil - through
  fractionation, we can tell what forms/pools its in, but fractionation assays
  are so EXPENSIVE</p> <p data-svelte-h="svelte-1h3742c">small experiment could be measuring carbon flux through a medium</p> <p data-svelte-h="svelte-1yu9vr5">then measuring it through soil</p> <p data-svelte-h="svelte-fg9ouk">then being able to quantify net in and net out</p> <p data-svelte-h="svelte-162kppf">aka making a <strong>Gas Analyzer Spectrometer</strong> or any
  <strong>infrared analyzer</strong></p> <p data-svelte-h="svelte-16ymte7">ai, quantum computing for climate analysis, gas analysis, gas flux,
  spectroscopy, precision agriculture, etc.</p> <p data-svelte-h="svelte-eiojnm">satellite things</p> <p data-svelte-h="svelte-18927sz"><a href="https://www.ycombinator.com/companies/wyvern">https://www.ycombinator.com/companies/wyvern</a></p> <p data-svelte-h="svelte-1i9kdtl"><a href="https://www.arraylabs.io/">https://www.arraylabs.io/</a></p> <p data-svelte-h="svelte-hu03d1"><a href="https://albedo.com/">https://albedo.com/</a></p> <p data-svelte-h="svelte-ffg6cj">call for projects in electro-geo chemistry <a href="http://carbon.ycombinator.com/electro-geo-chemistry/">http://carbon.ycombinator.com/electro-geo-chemistry/</a></p> <p data-svelte-h="svelte-acqewe">autochambers for greenhouse gas analysis → useful but why is this company so
  poor?</p> <p data-svelte-h="svelte-1xouq3j"><a href="https://agri-epicentre.com/solutions/soil-crop-technology/soil-flux-360/">https://agri-epicentre.com/solutions/soil-crop-technology/soil-flux-360/</a></p> <p data-svelte-h="svelte-1ydnwh1">papers on ghg and gas flux</p> <p data-svelte-h="svelte-9juewz"><a href="https://www.frontiersin.org/articles/10.3389/fclim.2021.742320/full">https://www.frontiersin.org/articles/10.3389/fclim.2021.742320/full</a></p> <p data-svelte-h="svelte-a2edqh"><a href="https://www.nature.com/articles/s41477-021-01042-5">https://www.nature.com/articles/s41477-021-01042-5</a></p> <p data-svelte-h="svelte-1pu44nq">diy raman spectroscope: <a href="https://pubs.acs.org/doi/10.1021/acs.jchemed.1c00584#">https://pubs.acs.org/doi/10.1021/acs.jchemed.1c00584#</a></p> <p data-svelte-h="svelte-gxwm4q">different production systems, their practices and their reasons for emitting
  what they do?</p> <p data-svelte-h="svelte-1p9xukb"><a href="https://www.usda.gov/sites/default/files/documents/USDATB1939_07072014.pdf">https://www.usda.gov/sites/default/files/documents/USDATB1939_07072014.pdf</a></p> <p data-svelte-h="svelte-13hc0s7"><strong>estimating carbon flux with quantum computing:</strong></p> <p data-svelte-h="svelte-1gg922o"><a href="https://science.nasa.gov/technology/technology-highlights/estimating-carbon-flux-with-quantum-computing"><strong>https://science.nasa.gov/technology/technology-highlights/estimating-carbon-flux-with-quantum-computing</strong></a></p> <p data-svelte-h="svelte-ola2ff"><a href="https://ebiquity.umbc.edu/person/html/Milton/Halem">Professor Milton Halem at University of Maryland Baltimore County</a></p>`;
});
export {
  Page as default
};

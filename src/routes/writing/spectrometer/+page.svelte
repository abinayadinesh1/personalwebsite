<hr />
<p>
  title: Inside a spectrometer subtitle: diff types, how to build one, use cases
  + more
</p>
<h2 id="date-07-22">date: 07/22</h2>
<h1 id="intro">intro</h1>
<p>used to measure the composition (chemical) of a particle</p>
<p>
  we are splitting electromagnetic radiation into its individual wavelengths
</p>
<h2 id="background">background</h2>
<p>
  an electromagnetic spectrum is made up of electromagnetic radiation, with
  varying frequency. each frequency has an associate wavelength, which has its
  own photon energy.
</p>
<p>which section of a electromagnetic spectrum does spectroscopy work on?</p>
<p>
  the electromagnetic spectrum can be organized by defining specific frequency
  ranges as bands that correlate to how those waves are produced, interact with
  matter, and are formed. this is what we see as <a
    href="https://en.wikipedia.org/wiki/Radio_wave">radio waves</a
  >, <a href="https://en.wikipedia.org/wiki/Microwave">microwaves</a>,
  <a href="https://en.wikipedia.org/wiki/Infrared">infrared</a>,
  <a href="https://en.wikipedia.org/wiki/Visible_light">visible light</a>,
  <a href="https://en.wikipedia.org/wiki/Ultraviolet">ultraviolet</a>,
  <a href="https://en.wikipedia.org/wiki/X-ray">X-rays</a>, and
  <a href="https://en.wikipedia.org/wiki/Gamma_ray">gamma rays</a>
  <img
    src="https://res.cloudinary.com/djp21wtxm/image/upload/v1690167289/i612x375-RIFMv9XEbrou_rreove.png"
    alt=""
  />
</p>
<p>
  energy - photons used for work ? wavelength is actually based on frequency.
</p>
<p>what has energy here? what is electromagnetic radiation?</p>
<p>
  the electromagnetic FIELD (not spectrum anymore) is made up of waves with
  specific characteristics, like being able to propogate freely in space without
  needing added input (also why its called the far field, it can move a great
  distance away from the source that produced it). they carry momentum and
  electromagnetic radiant energy.
</p>
<p>light is both a particle and a wave</p>
<h1 id="types">types</h1>
<ul>
  <li>
    mass spec - takes a gas and is able to measure the spectrum of masses of all
    the gases/particles
    <ul>
      <li>
        tells you the <strong>mass to charge ratio of ions</strong> which allows
        you to know exactly what the chemical composition is of what you are looking
        at
      </li>
    </ul>
  </li>
  <li>
    optical spectrometer - is able to separate the unique wavelengths that make
    up visible light
    <ul>
      <li>
        can only work on specific sections of the electromagnetic spectrum
        (probably the part to the right and left of the visible spectrum)
      </li>
      <li>
        different wavelengths of light are separated by <a
          href="https://en.wikipedia.org/wiki/Refraction">refraction</a
        >
        in a <a href="https://en.wikipedia.org/wiki/Prism_(optics">prism</a>) or
        by <a href="https://en.wikipedia.org/wiki/Diffraction">diffraction</a>
        by a
        <a href="https://en.wikipedia.org/wiki/Diffraction_grating"
          >diffraction grating</a
        >
      </li>
      <li>
        apparently what you are actually measuring is the irradiance (intensity)
        or polarization state
      </li>
      <li>includes infrared</li>
    </ul>
  </li>
  <li>nmr</li>
  <li>
    raman spectroscopy and infrared spectroscopy are often used in conjunction
    <ul>
      <li>
        uses a beam of light (like a laser) to excite a bunch of photons and
        create raman scattering
      </li>
      <li>
        how much the resulting photons shift up or down decides what the
        chemical bonds in the sample are
      </li>
    </ul>
  </li>
</ul>
<p>
  <img
    src="innards%20of%20a%20spectrometer%20e22f524b6ec3429a8d0e281e541a03c3/web.png.gif"
    alt="web.png.gif"
  />
</p>
<h2 id="collecting-evidence">Collecting evidence</h2>
<p>
  <a
    href="https://hubblesite.org/contents/articles/spectroscopy-reading-the-rainbow"
    >https://hubblesite.org/contents/articles/spectroscopy-reading-the-rainbow</a
  > fun article from hubble space
</p>
<p>
  <a href="https://www.instructables.com/DIY-Low-Cost-Spectrometer/"
    >https://www.instructables.com/DIY-Low-Cost-Spectrometer/</a
  >
</p>
<ul>
  <li>doable</li>
  <li>visible light spectrum</li>
</ul>
<p>how this worked:</p>
<p>
  make a completely black box (to absorb any light not coming from the light
  source)
</p>
<p>make a box with a tiny slit in the front for which light can enter from</p>
<p>
  put a webcam in the box and connect it to a camera, place a diffraction
  grating on it (like a cd) which takes light and diffracts it based on the
  wavelength
</p>
<p>
  shine light into the box, it will hit the diffraction grating and scatter into
  individual wavelengths of EMR which will show up in the image the webcam
  produces.
</p>
<p>
  you convert the image into wavelengths using opencv + a simple script
  (attached)
</p>
<p>
  to look at the wavelengths/compositions of certain media, can pass it through
  a clear box of that liquid
</p>
<p>
  <a
    href="http://engineering.nyu.edu/gk12/amps-cbri/pdf/visible_light_spectrophotometer.pdf"
    >http://engineering.nyu.edu/gk12/amps-cbri/pdf/visible_light_spectrophotometer.pdf</a
  >
</p>
<ul>
  <li>spectrophotometer from NYU</li>
</ul>
<p>near-IR spectrometer</p>
<p>
  <a href="https://caoyuan.scripts.mit.edu/ir_spec.html"
    >https://caoyuan.scripts.mit.edu/ir_spec.html</a
  > goated af
</p>
<p>
  <a
    href="https://physicscourses.colorado.edu/phys4430/phys4430_fa18/Labs/Build%20a%20spectrometer%20v2.pdf"
    >https://physicscourses.colorado.edu/phys4430/phys4430_fa18/Labs/Build a
    spectrometer v2.pdf</a
  > requires materials that i dont have but great intro to diffraction grating
</p>
<p>measure chemical composition of air</p>
<p>
  when you are trying to measure things you cant see on the visible eye, you
  have to use something longer or shorter to fix the wavelength.
</p>
<p>
  a visible light beam (like a laser) will still interact with the particles,
  but only ones within a specific frequency range. <strong
    >ER source and particle you are looking for must be in the same frequency
    range?</strong
  >
</p>
<p>do diffraction graters differ depending on the light source and sample?</p>
<p>
  GREENHOUSE GASES (characteristically) ABSORB INFRARED. they trap heat energy
  that would otherwise leave as infrared light.
</p>
<p>
  <strong
    >greenhouse gases take infrared light emitted as a result of chemical
    reactions and absorb it, keeping heat in the atmosphere that otherwise would
    have left.</strong
  >
</p>
<p>
  infrared working group at NCAR: <a href="https://www2.acom.ucar.edu/irwg"
    >https://www2.acom.ucar.edu/irwg</a
  >
</p>
<p>network for the detection of atmospheric composition change:</p>
<p>
  Lidar, which stands for Light Detection and Ranging, is a remote sensing
  method that uses light in the form of a pulsed laser to measure <strong
    >ranges (variable distances) to the Earth</strong
  >.
</p>
<p>used to tell distance from source</p>
<p>FTIR spectroscopy is very optimal method of analyzing IR light</p>
<p>
  cool guy at nasa, official <a
    href="https://ndacc.larc.nasa.gov/instruments/ftir-spectrometer"
    >https://ndacc.larc.nasa.gov/instruments/ftir-spectrometer</a
  >
</p>
<p>
  <a href="https://airbornescience.nasa.gov/person/Gao_Chen"
    >https://airbornescience.nasa.gov/person/Gao_Chen</a
  >
</p>
<p>
  <a
    href="https://chem.libretexts.org/Bookshelves/Physical_and_Theoretical_Chemistry_Textbook_Maps/Supplemental_Modules_(Physical_and_Theoretical_Chemistry"
    >how ftir operates</a
  >/Spectroscopy/Vibrational_Spectroscopy/Infrared_Spectroscopy/How_an_FTIR_Spectrometer_Operates)
</p>
<p>Jesse Kroll - atmospheric composition at mit</p>
<p>
  <a
    href="https://climate.mit.edu/users/mit-department-earth-atmospheric-and-planetary-sciences"
    >https://climate.mit.edu/users/mit-department-earth-atmospheric-and-planetary-sciences</a
  >
</p>
<p>
  <a
    href="https://climate.mit.edu/users/mit-joint-program-science-and-policy-global-change"
    >https://climate.mit.edu/users/mit-joint-program-science-and-policy-global-change</a
  >
</p>
<p>agriculture, climate</p>
<p>
  how much carbon is ur farm sequestering? low quality because we dont know what
  form/how long. we only know flux.
</p>
<p>
  better way to measure is by sampling for carbon in the soil - through
  fractionation, we can tell what forms/pools its in, but fractionation assays
  are so EXPENSIVE
</p>
<p>small experiment could be measuring carbon flux through a medium</p>
<p>then measuring it through soil</p>
<p>then being able to quantify net in and net out</p>
<p>
  aka making a <strong>Gas Analyzer Spectrometer</strong> or any
  <strong>infrared analyzer</strong>
</p>
<p>
  ai, quantum computing for climate analysis, gas analysis, gas flux,
  spectroscopy, precision agriculture, etc.
</p>
<p>satellite things</p>
<p>
  <a href="https://www.ycombinator.com/companies/wyvern"
    >https://www.ycombinator.com/companies/wyvern</a
  >
</p>
<p><a href="https://www.arraylabs.io/">https://www.arraylabs.io/</a></p>
<p><a href="https://albedo.com/">https://albedo.com/</a></p>
<p>
  call for projects in electro-geo chemistry <a
    href="http://carbon.ycombinator.com/electro-geo-chemistry/"
    >http://carbon.ycombinator.com/electro-geo-chemistry/</a
  >
</p>
<p>
  autochambers for greenhouse gas analysis → useful but why is this company so
  poor?
</p>
<p>
  <a
    href="https://agri-epicentre.com/solutions/soil-crop-technology/soil-flux-360/"
    >https://agri-epicentre.com/solutions/soil-crop-technology/soil-flux-360/</a
  >
</p>
<p>papers on ghg and gas flux</p>
<p>
  <a href="https://www.frontiersin.org/articles/10.3389/fclim.2021.742320/full"
    >https://www.frontiersin.org/articles/10.3389/fclim.2021.742320/full</a
  >
</p>
<p>
  <a href="https://www.nature.com/articles/s41477-021-01042-5"
    >https://www.nature.com/articles/s41477-021-01042-5</a
  >
</p>
<p>
  diy raman spectroscope: <a
    href="https://pubs.acs.org/doi/10.1021/acs.jchemed.1c00584#"
    >https://pubs.acs.org/doi/10.1021/acs.jchemed.1c00584#</a
  >
</p>
<p>
  different production systems, their practices and their reasons for emitting
  what they do?
</p>
<p>
  <a
    href="https://www.usda.gov/sites/default/files/documents/USDATB1939_07072014.pdf"
    >https://www.usda.gov/sites/default/files/documents/USDATB1939_07072014.pdf</a
  >
</p>
<p><strong>estimating carbon flux with quantum computing:</strong></p>
<p>
  <a
    href="https://science.nasa.gov/technology/technology-highlights/estimating-carbon-flux-with-quantum-computing"
    ><strong
      >https://science.nasa.gov/technology/technology-highlights/estimating-carbon-flux-with-quantum-computing</strong
    ></a
  >
</p>
<p>
  <a href="https://ebiquity.umbc.edu/person/html/Milton/Halem"
    >Professor Milton Halem at University of Maryland Baltimore County</a
  >
</p>

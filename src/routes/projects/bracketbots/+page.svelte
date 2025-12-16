<script>
import SvelteMarkdown from "svelte-markdown";
const source = `
### a friendly 5 foot tall bot that can make sandwiches for you

over the weekend, i flew to across the country for the BEST hardware hackathon to take place, hosted by Brian Machado at UWaterloo.  

in < 14 hours of pure engineering, we built a 'wifey' bot that can make sandwiches for you!!

apart from the features of the base bracket bot (self balancing, rc'able, cameras, etc.), we added a 6DOF teleoperable arm that we controlled to pick up bread + other sandwich ingredients. may not be the most tasty, but at least it's made with love <3 
`

</script>


<div class="markdown-wrapper">
  <SvelteMarkdown {source} />
</div>

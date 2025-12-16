<script>
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import '../../styles/components/contributions.css';
    
    export let contributions = {};
    
    let container;
    let graphInstance = null;
    let mounted = false;
    let isRendering = false;
    
    async function renderGraph() {
      // Prevent multiple simultaneous renders
      if (isRendering) {
        console.log('ContributionsGraph: Already rendering, skipping');
        return;
      }
      
      isRendering = true;
      if (!browser || !mounted) {
        return;
      }
      
      if (!container) {
        console.log('ContributionsGraph: Container not ready');
        return;
      }
      
      if (!contributions || typeof contributions !== 'object' || Object.keys(contributions).length === 0) {
        console.log('ContributionsGraph: No contributions data', contributions);
        return;
      }
      
      // Validate data structure
      const hasValidData = Object.values(contributions).some(yearData => 
        Array.isArray(yearData) && yearData.length > 0
      );
      
      if (!hasValidData) {
        console.log('ContributionsGraph: Invalid data structure', contributions);
        return;
      }
      
      try {
        console.log('ContributionsGraph: Rendering with data:', contributions);
        // Dynamic import to avoid SSR issues
        const { default: ContributionGraph } = await import('github-contribution-graph');
        
        // Clear existing graph if any
        if (graphInstance) {
          try {
            if (container) {
              container.innerHTML = '';
            }
          } catch (e) {
            console.warn('Error clearing container:', e);
          }
          graphInstance = null;
        }
        
        // Ensure container is in the DOM
        if (!container || !container.parentElement) {
          console.log('ContributionsGraph: Container not in DOM');
          return;
        }
        
        // Create a deep copy and sanitize data structure
        const dataCopy = {};
        for (const [year, yearData] of Object.entries(contributions)) {
          if (Array.isArray(yearData) && yearData.length > 0) {
            // Filter out any invalid entries
            dataCopy[year] = yearData.filter(entry => 
              entry && 
              typeof entry === 'object' && 
              typeof entry.done === 'number' && 
              typeof entry.date === 'string'
            );
          }
        }
        
        // Only proceed if we have valid data
        if (Object.keys(dataCopy).length === 0) {
          console.log('ContributionsGraph: No valid data after sanitization');
          return;
        }
        
        graphInstance = new ContributionGraph(container, {
          data: dataCopy,
          // Optional configuration
          primary_color: '#cd7f32',
          secondary_color: '#ebedf0',
          tooltip: true,
          global_stats: true
        });
        console.log('ContributionsGraph: Graph rendered successfully');
      } catch (error) {
        console.error('Error rendering contribution graph:', error);
        console.error('Error details:', {
          container: container,
          containerParent: container?.parentElement,
          contributions: contributions,
          contributionsType: typeof contributions,
          contributionsKeys: contributions ? Object.keys(contributions) : 'N/A'
        });
      } finally {
        isRendering = false;
      }
    }
    
    onMount(() => {
      mounted = true;
      // Wait a tick to ensure container is bound
      setTimeout(() => {
        renderGraph();
      }, 100);
    });
    
    // Reactive statement to re-render when contributions change
    $: if (mounted && contributions && typeof contributions === 'object' && Object.keys(contributions).length > 0) {
      // Use a longer timeout to ensure DOM is ready
      setTimeout(() => {
        renderGraph();
      }, 200);
    }
    
    onDestroy(() => {
      if (container && graphInstance) {
        container.innerHTML = '';
        graphInstance = null;
      }
    });
  </script>
  
  <div bind:this={container} class="contribution-graph"></div>
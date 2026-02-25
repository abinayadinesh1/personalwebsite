<script>
  const subjects = ["General", "Ag", "Farmer Interviews", "Notes"];
  let selectedSubjects = ["General"];

  function toggleSubject(subject) {
    if (selectedSubjects.includes(subject)) {
      selectedSubjects = selectedSubjects.filter(s => s !== subject);
    } else {
      selectedSubjects = [...selectedSubjects, subject];
    }
  }

  function selectAll() {
    selectedSubjects = [...subjects];
  }

  $: filteredPosts = posts.filter(p => selectedSubjects.includes(p.subject));

  const posts = [
    {
      title: "favorite publications of 2024",
      date: "01.07.25",
      subject: "General",
      href: "./writing/fav_pubs"
    },
    {
      title: "a lit review including parallelized trajectory optimization",
      date: "01.22.25",
      subject: "General",
      href: "https://docs.google.com/document/d/1UOtDPD3F_469Qe_RGj4N10eKHTV5VavyjYZcgpg0Yyw/edit?usp=sharing"
    },
    {
      title: "how to drive to maximize your passengers comfort",
      date: "01.07.25",
      subject: "General",
      href: "./writing/driving"
    },
    {
      title: "how to write an email to a researcher (undergrad)",
      date: "11.19.24",
      subject: "General",
      href: "./writing/researcher"
    },
    {
      title: "IAS: an environment for genius",
      date: "07.24.24",
      subject: "General",
      href: "./writing/homeforgenius"
    },
    {
      title: "should tech people read the news?",
      date: "12.28.23",
      subject: "General",
      href: "./writing/readthenews",
      starred: true
    },
    {
      title: "why do economies at scale break down with agriculture?",
      date: "2.17.24",
      subject: "Ag",
      href: "./writing/economiesofscale"
    },
    {
      title: "the deep connections between soil and greenhouse gas emissions",
      date: "8.6.23",
      subject: "Ag",
      href: "https://docs.google.com/document/d/1UwPVsQsHbcuBo2-CUYT1dk7Ymp6Jl2NDv5esT4iS5vw/edit?usp=sharing"
    },
    {
      title: "the role of mycorrhizal fungi in plant growth and development",
      date: "4.21.23",
      subject: "Ag",
      href: "https://docs.google.com/document/d/1aw5Nn2ph2TABpfSMn1JqiJZblZ7yP6rOiH7Hd4tXpQY/edit?usp=sharing"
    },
    {
      title: "deep dives on spectrometers",
      date: "07.23.23",
      subject: "Ag",
      href: "./writing/spectrometer"
    },
    {
      title: "metagenomic time series analysis on nitrate reduction pathway in cattle gut",
      date: "5.2.23",
      subject: "Ag",
      href: "https://docs.google.com/presentation/d/1Z8ebEN76z4dJMa5gXSBFIMoTtN-JtdcPauNKf1b8Y-g/edit?usp=sharing"
    },
    {
      title: "how synthetic fertilizer impacts microbial diversity",
      date: "4.30.23",
      subject: "Ag",
      href: "https://www.notion.so/Winogradsky-Columns-Report-3-fb51de6e68e84730909f24d890c7c487?pvs=4"
    },
    {
      title: "the impacts of conventional agriculture on public health",
      date: "",
      subject: "Ag",
      href: "./writing/agonpublichealth"
    },
    {
      title: "a whitepaper on the decline of soil health and means to repair",
      date: "",
      subject: "Ag",
      href: "https://docs.google.com/document/d/1J0cMUOZxR5uYQW0_8o-8rmIfRiUbMCjCkNdIXq2oV_k/edit?usp=sharing"
    },
    {
      title: "the industry of soil pH",
      date: "",
      subject: "Ag",
      href: "./writing/phofsoil"
    },
    {
      title: "Interview with Durst Organic Farms",
      date: "",
      subject: "Farmer Interviews",
      href: "./writing/farmerinterviews/durstorganic"
    },
    {
      title: "Interview with Ratto Brothers",
      date: "",
      subject: "Farmer Interviews",
      href: "./writing/farmerinterviews/rattobrothers"
    },
    {
      title: "Interview with Cloverfield Organic Farms",
      date: "",
      subject: "Farmer Interviews",
      href: "./writing/farmerinterviews/cloverfieldorganics"
    },
    {
      title: "Interview with Park Farming",
      date: "",
      subject: "Farmer Interviews",
      href: "./writing/farmerinterviews/parkfarming"
    },
    {
      title: "coursework",
      date: "",
      subject: "Notes",
      href: "./secret/coursework/"
    },
    {
      title: "ag ideas",
      date: "",
      subject: "Notes",
      href: "./writing/notes/"
    }
  ];
</script>

<div class="writing-page">
  <h1>Writing</h1>

  <div class="filter-bar">
    <span class="filter-label">Filter by subject:</span>
    <div class="filter-options">
      {#each subjects as subject}
        <button
          class="filter-btn"
          class:active={selectedSubjects.includes(subject)}
          on:click={() => toggleSubject(subject)}
        >
          {subject}
        </button>
      {/each}
      {#if selectedSubjects.length < subjects.length}
        <button class="filter-btn show-all" on:click={selectAll}>
          Show all
        </button>
      {/if}
    </div>
  </div>

  <table class="writing-table">
    <thead>
      <tr>
        <th>Title</th>
        <th>Date</th>
        <th>Subject</th>
      </tr>
    </thead>
    <tbody>
      {#each filteredPosts as post}
        <tr>
          <td>
            {#if post.starred}<span class="star">&#11088;&#65039;</span>{/if}
            <a href={post.href}>{post.title}</a>
          </td>
          <td class="date-cell">{post.date || '—'}</td>
          <td class="subject-cell">{post.subject}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .writing-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    text-align: center;
  }

  .writing-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    margin: 0 auto;
  }

  .writing-table thead th {
    padding: 0.4rem 1rem;
    border-bottom: 1px solid rgba(180, 235, 203, 0.5);
    border-right: 1px solid rgba(180, 235, 203, 0.5);
    font-size: 0.9em;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .writing-table thead th:last-child {
    border-right: none;
  }

  .writing-table tbody td {
    padding: 0.35rem 1rem;
    font-size: 0.85em;
    vertical-align: top;
    border-bottom: 1px solid rgba(180, 235, 203, 0.5);
    border-right: 1px solid rgba(180, 235, 203, 0.5);
  }

  .writing-table tbody td:last-child {
    border-right: none;
  }

  .writing-table tbody tr:last-child td {
    border-bottom: none;
  }

  .date-cell {
    white-space: nowrap;
    width: 70px;
  }

  .subject-cell {
    white-space: nowrap;
    width: 80px;
  }

  /* Filter bar */
  .filter-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-label {
    font-size: 0.85em;
  }

  .filter-options {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .filter-btn {
    padding: 0.3rem 0.7rem;
    font-size: 0.8em;
    border: 1px solid rgba(180, 235, 203, 0.5);
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.45;
    transition: opacity 0.15s;
  }

  .filter-btn.active {
    opacity: 1;
    border-color: rgba(180, 235, 203, 0.8);
  }

  .filter-btn.show-all {
    opacity: 0.6;
    border-style: dashed;
  }

  .filter-btn:hover {
    opacity: 1;
  }

  .writing-table a {
    color: transparent;
    text-decoration: underline;
    text-decoration-color: rgba(205, 127, 50, 0.2);
    -webkit-text-decoration-color: rgba(205, 127, 50, 0.2);
  }

  .star {
    margin-right: 0.25rem;
  }

  @media (max-width: 600px) {
    .writing-table {
      font-size: 0.8em;
    }

    .writing-table td,
    .writing-table th {
      padding: 0.4rem 0.5rem;
    }
  }
</style>

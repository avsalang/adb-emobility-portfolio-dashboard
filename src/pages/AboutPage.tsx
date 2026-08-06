const ADB_PROJECTS_PORTAL =
  'https://www.adb.org/projects?searchstax%5Bquery%5D=*&searchstax%5Bpage%5D=1&searchstax%5Border%5D=ds_date_board%20desc';

export function AboutPage() {
  return (
    <div className="page about-page">
      <header className="about-heading">
        <span>About</span>
        <h1>ADB E-Mobility Portfolio Explorer</h1>
        <p>
          Explore ADB-supported e-mobility projects, funding and reported
          outputs across Asia and the Pacific.
        </p>
      </header>

      <article className="about-panel">
        <section>
          <h3>Overview</h3>
          <p>
            This dashboard provides an overview of ADB-supported projects that
            include e-mobility activities. It covers projects from transport,
            energy, finance, urban development, industry, education and other
            sectors where electric mobility forms part of the project scope.
          </p>
          <p>
            Users can examine where projects are located, how funding is
            distributed, which technologies and parts of the e-mobility value
            chain are supported, and what physical and nonphysical outputs are
            reported. The Project Explorer provides access to the individual
            records behind the charts.
          </p>
          <p>
            The dashboard is intended for portfolio analysis and knowledge
            sharing. It does not replace official ADB project records. Users
            should refer to the original project pages for complete and current
            information.
          </p>
        </section>

        <section>
          <h3>Scope and Limitations</h3>
          <p>
            The portfolio was developed by screening publicly available ADB
            project information for evidence of e-mobility activities.
            Information was collected from ADB project web pages, including
            project data, descriptions, objectives, outputs, financing
            information and implementation updates. Linked project documents
            and other downloadable files were not systematically included in
            the primary data collection.
          </p>
          <p>
            Some fields are taken directly from ADB project pages, including
            the project number, title, recipient, approval year, sector,
            project type, assistance modality, status, funding amounts and
            reported outputs. Other fields are analytical classifications
            developed for the dashboard, including e-mobility inclusion,
            technology subthemes, transport modes, value-chain stages,
            cross-cutting priorities, funding attribution and output
            categories.
          </p>
          <p>
            AI-assisted tagging was used to screen the larger project dataset
            and identify possible e-mobility projects. Candidate projects and
            their classifications were then reviewed at the project level
            using the available project text. These tags are analytical
            classifications used by the Asian Transport Observatory and are
            not official ADB classifications.
          </p>
          <p>
            Associated project funding represents the value of projects that
            contain an e-mobility activity, including projects where
            e-mobility is one component of a wider operation. Identified
            e-mobility funding includes only amounts that can be directly linked
            to an e-mobility activity. A blank identified amount means that a
            separate amount could not be established from the available
            information; it does not mean that the project provided no support
            for e-mobility.
          </p>
          <p>
            Reported outputs are included only when supported by explicit
            project text. Planned or financed outputs are kept separate from
            outputs reported as delivered or operational. Project and output
            counts may overlap because a project can support several
            technologies, modes, value-chain stages or output types.
          </p>
        </section>

        <section>
          <h3>Disclaimer</h3>
          <p>
            This dashboard is intended for research, portfolio analysis and
            knowledge-sharing purposes. While the project records and
            classifications were reviewed for consistency, the dashboard
            should not be treated as an official or complete ADB inventory of
            e-mobility investments. Source information may change as project
            pages are updated. Users should consult the original ADB project
            pages and documents for official project details.
          </p>
        </section>

        <section>
          <h3>Sources</h3>
          <p>
            The dashboard is based primarily on publicly available information
            from ADB project web pages. The full public catalogue can be
            accessed through the{' '}
            <a href={ADB_PROJECTS_PORTAL} target="_blank" rel="noreferrer">
              ADB Projects portal
            </a>
            . Links to the source page for each project are also provided in
            the Project Explorer.
          </p>
        </section>
      </article>
    </div>
  );
}

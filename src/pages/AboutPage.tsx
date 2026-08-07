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
            AI-assisted, context-based tagging was used to screen the larger
            project dataset and identify possible e-mobility projects. This was
            not a direct keyword or synonym-dictionary search. Candidate
            projects and their classifications were then reviewed at the
            project level using the available project text. These tags are
            analytical classifications used by the Asian Transport Observatory
            and are not official ADB classifications.
          </p>
          <p>
            Associated funding is the total project amount reported in the
            publicly available project data sheets for projects included in the
            portfolio. Identified e-mobility funding is the portion that can be
            specifically attributed to e-mobility from the same information.
            For mixed projects, only a separately stated e-mobility amount is
            counted. Where an e-mobility component is described but no component
            amount is reported, it is not added to the identified total. A blank
            identified amount therefore means not separately quantified, not
            zero e-mobility support.
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
          <h3>Acknowledgements</h3>
          <p>
            This tool was developed with support from ADB&apos;s TA-6763 REG:
            Accelerating Innovation in Transport, under the Pathways for
            Decarbonization of the Transport Sector project. The project is
            funded by the Foreign, Commonwealth &amp; Development Office
            (FCDO) and implemented by ADB in coordination with the Climate
            Compatible Growth (CCG) programme. It is also meant to support the
            E-mobility Support and Investment Platform for Asia and the Pacific
            being managed by the ADB.
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

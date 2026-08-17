import type { CSSProperties } from 'react';

interface Callout {
  marker: string;
  label: string;
  left: string;
  top: string;
  width: string;
  height: string;
}

interface DefinitionItem {
  term: string;
  description: string;
}

function AnnotatedScreenshot({
  src,
  alt,
  callouts,
}: {
  src: string;
  alt: string;
  callouts: Callout[];
}) {
  return (
    <figure className="howto-figure">
      <div className="howto-image-wrap">
        <img src={`${import.meta.env.BASE_URL}how-to/${src}`} alt={alt} />
        {callouts.map((callout) => (
          <span
            key={callout.marker}
            className="howto-highlight"
            style={
              {
                '--callout-left': callout.left,
                '--callout-top': callout.top,
                '--callout-width': callout.width,
                '--callout-height': callout.height,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <b>{callout.marker}</b>
          </span>
        ))}
      </div>
      <figcaption>
        {callouts.map((callout) => (
          <span key={callout.marker}>
            <b>{callout.marker}</b>
            {callout.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

function DefinitionGroups({
  groups,
}: {
  groups: { title: string; items: DefinitionItem[] }[];
}) {
  return (
    <div className="howto-definitions">
      <h3>Definitions</h3>
      {groups.map((group) => (
        <details key={group.title} className="howto-definition-group">
          <summary>{group.title}</summary>
          <dl>
            {group.items.map((item) => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.description}</dd>
              </div>
            ))}
          </dl>
        </details>
      ))}
    </div>
  );
}

const NAVIGATION_CALLOUTS: Callout[] = [
  {
    marker: 'A',
    label: 'Choose an analysis page from the navigation panel.',
    left: '0.6%',
    top: '20%',
    width: '13.5%',
    height: '79%',
  },
  {
    marker: 'B',
    label: 'Use the filters to define the portfolio shown across the dashboard.',
    left: '15.4%',
    top: '20%',
    width: '83%',
    height: '27%',
  },
  {
    marker: 'C',
    label: 'Check the page description and the number of projects in the current selection.',
    left: '16.7%',
    top: '53%',
    width: '81%',
    height: '34%',
  },
];

const OVERVIEW_CALLOUTS: Callout[] = [
  {
    marker: 'A',
    label: 'Compare associated funding and project counts by approval or expected year.',
    left: '0.4%',
    top: '0.8%',
    width: '71.8%',
    height: '98%',
  },
  {
    marker: 'B',
    label: 'Read the current delivery status and the number of recipient economies.',
    left: '73.7%',
    top: '0.8%',
    width: '25.9%',
    height: '98%',
  },
];

const FUNDING_CALLOUTS: Callout[] = [
  {
    marker: 'A',
    label: 'Compare sovereign and nonsovereign activity over time.',
    left: '0.4%',
    top: '0.8%',
    width: '48.8%',
    height: '98%',
  },
  {
    marker: 'B',
    label: 'See how loans, grants and technical assistance contribute by year.',
    left: '50.7%',
    top: '0.8%',
    width: '48.9%',
    height: '98%',
  },
];

const TECHNOLOGY_CALLOUTS: Callout[] = [
  {
    marker: 'A',
    label: 'Subtheme counts overlap because a project may address several areas.',
    left: '0.4%',
    top: '0.8%',
    width: '64.7%',
    height: '98%',
  },
  {
    marker: 'B',
    label: 'Each project has one e-mobility role: Principal, Partial or Indirect.',
    left: '66.2%',
    top: '0.8%',
    width: '33.4%',
    height: '98%',
  },
];

const OUTPUT_CALLOUTS: Callout[] = [
  {
    marker: 'A',
    label: 'Delivered fleet includes quantified vehicles reported as delivered or operational.',
    left: '0.4%',
    top: '0.8%',
    width: '48.8%',
    height: '98%',
  },
  {
    marker: 'B',
    label: 'Fleet pipeline includes planned, approved, financed or proposed vehicles.',
    left: '50.7%',
    top: '0.8%',
    width: '48.9%',
    height: '98%',
  },
];

const PROJECT_CALLOUTS: Callout[] = [
  {
    marker: 'A',
    label: 'Search the filtered portfolio by project number, title, recipient or sector.',
    left: '46%',
    top: '25%',
    width: '37%',
    height: '13%',
  },
  {
    marker: 'B',
    label: 'Download the current selection as an Excel workbook.',
    left: '82.5%',
    top: '25%',
    width: '14%',
    height: '13%',
  },
  {
    marker: 'C',
    label: 'Sort the table or select a project to open its full dashboard record.',
    left: '2%',
    top: '45%',
    width: '96%',
    height: '53%',
  },
];

const FILTER_DEFINITIONS = [
  {
    title: 'Portfolio filters',
    items: [
      { term: 'Recipient', description: 'Limits the portfolio to an individual recipient economy or to regional projects.' },
      { term: 'Approval or expected year', description: 'Sets the inclusive year range using approval year, or expected approval year for proposed projects.' },
      { term: 'Status', description: 'Limits projects to Active, Approved, Proposed or Closed records.' },
      { term: 'Project type', description: 'Limits projects to sovereign or nonsovereign operations.' },
      { term: 'E-mobility role', description: 'Limits projects according to whether e-mobility is Principal, Partial or Indirect to their scope.' },
      { term: 'Subtheme', description: 'Limits projects to those assigned the selected e-mobility subtheme.' },
      { term: 'Reset', description: 'Clears all portfolio filters and restores the full project set.' },
    ],
  },
];

const OVERVIEW_DEFINITIONS = [
  {
    title: 'Portfolio measures',
    items: [
      {
        term: 'Filtered scope',
        description: 'The number of projects meeting all active portfolio filters.',
      },
      {
        term: 'Associated project funding',
        description: 'The full reported value of projects in the selection, including wider project components beyond e-mobility.',
      },
      {
        term: 'Identified e-mobility funding',
        description: 'The portion of project funding that can be separately quantified and attributed to e-mobility. It is a documented minimum.',
      },
      {
        term: 'Approval or expected year',
        description: 'Board approval year for approved projects and the expected approval year for proposed projects.',
      },
      {
        term: 'Recipient economies',
        description: 'Distinct recipient economies represented in the filtered portfolio, not the number of projects or project locations.',
      },
    ],
  },
  {
    title: 'Delivery status and map',
    items: [
      {
        term: 'Active',
        description: 'An approved project recorded as active or under implementation.',
      },
      {
        term: 'Approved',
        description: 'A project approved by ADB but not recorded as active in the source data.',
      },
      {
        term: 'Proposed',
        description: 'A project in the ADB pipeline that has not yet received Board approval.',
      },
      {
        term: 'Closed',
        description: 'A project recorded as closed or completed.',
      },
      {
        term: 'Geographic footprint',
        description: 'Reported project activity locations. Country coordinates are used when no more specific city, province, site or corridor is available.',
      },
    ],
  },
];

const FUNDING_DEFINITIONS = [
  {
    title: 'Funding views',
    items: [
      {
        term: 'Associated funding',
        description: 'Full reported project funding associated with the selected e-mobility portfolio.',
      },
      {
        term: 'Projects',
        description: 'Unique projects in the selection. A project may appear under more than one assistance type.',
      },
      {
        term: 'Identified e-mobility funding',
        description: 'Only separately reported amounts attributable to e-mobility; totals are minimums.',
      },
      {
        term: 'Sovereign',
        description: 'ADB assistance provided to or guaranteed by a government.',
      },
      {
        term: 'Nonsovereign',
        description: 'ADB assistance provided without a sovereign guarantee, generally to private or other nonsovereign entities.',
      },
    ],
  },
  {
    title: 'Assistance and recipient panels',
    items: [
      {
        term: 'Loan',
        description: 'Repayable financing recorded as a loan in the project assistance data.',
      },
      {
        term: 'Grant',
        description: 'Nonrepayable project financing recorded as a grant.',
      },
      {
        term: 'Technical assistance',
        description: 'Support for preparation, knowledge, policy, capacity or implementation rather than a conventional investment loan or grant.',
      },
      {
        term: 'Sovereign and nonsovereign trajectory',
        description: 'The selected funding measure or project count by project type and approval or expected year.',
      },
      {
        term: 'Assistance mix over time',
        description: 'Loans, grants and technical assistance by year. Identified funding follows each project\'s recorded assistance shares.',
      },
      {
        term: 'Recipient ranking',
        description: 'Recipients ordered by the selected funding measure or unique project count. Available country splits are used for regional projects.',
      },
    ],
  },
];

const TECHNOLOGY_DEFINITIONS = [
  {
    title: 'E-mobility role and distributions',
    items: [
      {
        term: 'Principal',
        description: 'E-mobility is the main or predominant focus of the project.',
      },
      {
        term: 'Partial',
        description: 'E-mobility is a confirmed component of a broader project that also supports other activities.',
      },
      {
        term: 'Indirect',
        description: 'The project supports enabling conditions or a potential pathway, but no distinct direct e-mobility investment is confirmed.',
      },
      {
        term: 'Vehicle and transport modes',
        description: 'Grouped vehicle or service types supported by the project. Assignments may overlap; General e-mobility scope means no more specific mode is stated.',
      },
      {
        term: 'Sector distribution',
        description: 'The single primary ADB sector recorded for each project. An e-mobility project may therefore be classified under Transport, Energy, Finance or another sector.',
      },
    ],
  },
  {
    title: 'Subthemes',
    items: [
      {
        term: 'Vehicles and fleet transition',
        description: 'Acquisition, leasing, replacement, retrofit, demonstration or deployment of electric and qualifying low-carbon vehicles.',
      },
      {
        term: 'Charging and power integration',
        description: 'Charging, swapping, grid connection, renewable supply, energy storage and other power systems serving electric transport.',
      },
      {
        term: 'Depots, operations and maintenance',
        description: 'Depots, service operations, fleet management, maintenance systems and operational capacity for e-mobility.',
      },
      {
        term: 'Manufacturing and battery circularity',
        description: 'Vehicle, battery or component production and supply chains, including reuse, second life, recycling and end-of-life management.',
      },
      {
        term: 'Finance and market development',
        description: 'Credit, investment, risk-sharing, business models and other measures that expand the market for e-mobility.',
      },
      {
        term: 'Policy and institutional capacity',
        description: 'Strategies, regulations, standards, planning, governance, institutional strengthening and skills development.',
      },
      {
        term: 'Digital mobility and fleet systems',
        description: 'Digital platforms, intelligent transport systems, fleet software, payment, data and related technology supporting e-mobility.',
      },
      {
        term: 'Integrated and enabling infrastructure',
        description: 'Wider transport infrastructure that enables electric mobility, such as corridors, terminals, stations and related urban systems.',
      },
    ],
  },
  {
    title: 'Value-chain stages',
    items: [
      {
        term: 'Research and preparation',
        description: 'Research, feasibility, planning, design, strategies and readiness work supporting later decisions or investment.',
      },
      {
        term: 'Production and supply',
        description: 'Production, assembly and supply-chain development for vehicles, batteries, components and equipment.',
      },
      {
        term: 'Vehicle acquisition',
        description: 'Procurement, financing, leasing, distribution, demonstration or deployment of vehicles.',
      },
      {
        term: 'Infrastructure deployment',
        description: 'Installation of charging, swapping, depot, power-system or other operating infrastructure.',
      },
      {
        term: 'Operations and maintenance',
        description: 'Ongoing service operation, fleet management, maintenance and supporting systems or capacity.',
      },
      {
        term: 'End-of-life and circularity',
        description: 'Vehicle and battery reuse, second-life applications, refurbishment, recycling and life extension.',
      },
      {
        term: 'Market and institutional enablers',
        description: 'Finance, policy, regulation, institutions, skills and market support that work across the value chain rather than one physical stage.',
      },
    ],
  },
  {
    title: 'Cross-cutting priorities',
    items: [
      { term: 'Climate mitigation', description: 'Greenhouse-gas reduction, decarbonization and low- or zero-emission transport.' },
      { term: 'Air quality and health', description: 'Reduced local air pollution, noise or related public-health impacts.' },
      { term: 'Gender and social inclusion', description: 'Gender equality, accessibility, equity and inclusion of underserved groups.' },
      { term: 'Institutional capacity', description: 'Stronger institutions, governance, coordination and implementation capacity.' },
      { term: 'Private sector development', description: 'Private investment, market creation, competition and local industry development.' },
      { term: 'Climate resilience', description: 'Adaptation and resilience of transport systems and services to climate risks.' },
      { term: 'Safety', description: 'Road, passenger, vehicle, charging or battery safety.' },
      { term: 'Energy efficiency', description: 'Reduced energy use or improved transport and vehicle energy performance.' },
      { term: 'Renewable and clean energy', description: 'Renewable electricity, clean energy, storage, grid reliability and energy transition.' },
      { term: 'Inclusive finance', description: 'Access to finance for households, small firms, operators or underserved market participants.' },
      { term: 'Connectivity and modal shift', description: 'Better access, multimodal links, congestion reduction and shifts toward more sustainable modes.' },
      { term: 'Affordability and livelihoods', description: 'Affordable mobility, poverty reduction, employment, jobs and livelihood benefits.' },
      { term: 'Technology and innovation', description: 'New technology, digital transformation, innovation and demonstration.' },
      { term: 'Public transport access', description: 'Expanded, improved or more inclusive public transport services.' },
      { term: 'Regional cooperation', description: 'Regional markets, knowledge exchange, coordination and cross-border cooperation.' },
    ],
  },
];

const OUTPUT_DEFINITIONS = [
  {
    title: 'Fleet cards',
    items: [
      {
        term: 'Delivered fleet',
        description: 'Quantified vehicles reported as delivered, completed or operational and directly attributable to e-mobility.',
      },
      {
        term: 'Fleet pipeline',
        description: 'Quantified vehicles reported as planned, approved, financed, under procurement or proposed. These are not completed deliveries.',
      },
      {
        term: 'Contributing projects',
        description: 'Unique projects supplying the quantified records included in the displayed fleet total.',
      },
    ],
  },
  {
    title: 'Output panels',
    items: [
      {
        term: 'Output coverage by project',
        description: 'The number and share of projects reporting each output family. It measures project coverage, not total physical quantities.',
      },
      {
        term: 'Primary output profile',
        description: 'One category assigned to each project according to its most concrete reported or intended e-mobility result.',
      },
      {
        term: 'Delivered or operational physical outputs',
        description: 'A completed physical e-mobility output is explicitly reported.',
      },
      {
        term: 'Physical outputs in progress',
        description: 'Physical implementation is underway but not reported as complete.',
      },
      {
        term: 'Planned or financed physical outputs',
        description: 'A physical output is planned, approved, financed or proposed but not yet delivered.',
      },
      {
        term: 'Policy, knowledge and capacity outputs',
        description: 'The clearest output is a policy, study, knowledge product, standard, training or institutional result.',
      },
      {
        term: 'Financing or eligibility only',
        description: 'The project provides finance or eligibility for e-mobility without a separately stated physical output.',
      },
      {
        term: 'No distinct or only potential e-mobility output',
        description: 'No distinct e-mobility output is confirmed, or e-mobility is only a possible future application.',
      },
    ],
  },
  {
    title: 'Output families',
    items: [
      { term: 'Vehicle and fleet deployment', description: 'Vehicle procurement, deployment, conversion or operation.' },
      { term: 'Charging and energy integration', description: 'Charging, swapping, grid, storage and energy-supply outputs.' },
      { term: 'Integrated transport infrastructure', description: 'Corridors, stations, terminals and wider transport infrastructure enabling e-mobility.' },
      { term: 'Depots and operations', description: 'Depots, maintenance, fleet management and transport-service operation.' },
      { term: 'Manufacturing and batteries', description: 'Vehicle, component or battery production, supply chains and circularity.' },
      { term: 'Digital mobility systems', description: 'Digital platforms, intelligent systems, data, payment and fleet software.' },
      { term: 'Finance and market development', description: 'Financing facilities, investment mechanisms and market-development outputs.' },
      { term: 'Policy and institutional capacity', description: 'Policies, plans, standards, knowledge, training and institutional strengthening.' },
      { term: 'Service coverage', description: 'Expansion or improvement of transport service availability and reach.' },
    ],
  },
];

const PROJECT_DEFINITIONS = [
  {
    title: 'Project table fields',
    items: [
      { term: 'Project number', description: 'ADB project identifier and link to the dashboard project record.' },
      { term: 'Approval or expected year', description: 'Board approval year, or expected approval year for a proposed project.' },
      { term: 'Recipient', description: 'Country, economy or regional grouping associated with the project.' },
      { term: 'Status', description: 'Current project status recorded as Active, Approved, Proposed or Closed.' },
      { term: 'Role', description: 'Principal, Partial or Indirect classification describing how central e-mobility is to the project.' },
      { term: 'Leading subthemes', description: 'The first two assigned e-mobility subthemes; the + count indicates additional subthemes.' },
      { term: 'Associated funding', description: 'Full reported project funding.' },
      { term: 'Identified e-mobility funding', description: 'Separately quantified funding attributable to e-mobility. A dash means no separate amount was available.' },
    ],
  },
  {
    title: 'Project record and workbook',
    items: [
      { term: 'Project detail panel', description: 'The consolidated project record, including source fields, classifications, locations, funding allocation and reported outputs.' },
      { term: 'ADB source link', description: 'Opens the official ADB project page for the current source record.' },
      { term: 'Projects sheet', description: 'One row per project with the main source fields and dashboard classifications.' },
      { term: 'KPI sheet', description: 'Structured project-output records used for the outputs and KPI page.' },
      { term: 'Recipient Funding sheet', description: 'Recorded or allocated funding by recipient, including available country splits for regional projects.' },
      { term: 'Modality Funding sheet', description: 'Recorded project funding by assistance type, including loans, grants and technical assistance.' },
    ],
  },
];

export function HowToPage() {
  return (
    <div className="page howto-page">
      <header className="howto-heading">
        <h1>How to use the dashboard</h1>
        <p>
          The dashboard combines information reported by ADB with a separate
          classification of each project's e-mobility content. Use it to
          examine the size and composition of the portfolio, compare funding
          and recipients, review technologies and outputs, and trace each
          result to the underlying project record.
        </p>
      </header>

      <nav className="howto-page-links" aria-label="How-to page sections">
        <a href="#guide-overview">Portfolio overview</a>
        <a href="#guide-funding">Funding &amp; geography</a>
        <a href="#guide-technology">Technology profile</a>
        <a href="#guide-outputs">Outputs &amp; KPIs</a>
        <a href="#guide-projects">Project explorer</a>
      </nav>

      <section className="howto-step">
        <header>
          <div>
            <h2>Navigation and filters</h2>
            <p>
              Start by defining the group of projects you want to examine.
            </p>
          </div>
        </header>
        <AnnotatedScreenshot
          src="navigation-and-filters.png"
          alt="Dashboard navigation, portfolio filters and page introduction"
          callouts={NAVIGATION_CALLOUTS}
        />
        <DefinitionGroups groups={FILTER_DEFINITIONS} />
        <div className="howto-reading-guide">
          <p>
            Select a recipient, year range, delivery status, project type,
            e-mobility role or subtheme. The filters work together, and the
            filtered project count updates after each selection. The same
            selection remains active as you move between pages. Use the reset
            button at the right of the filter row to return to the full
            portfolio.
          </p>
          <p>
            Hover over charts and map markers for exact values. Select View
            data or View projects where available to inspect the records behind
            a figure. Some classifications are multi-label, so one project may
            appear under several subthemes, modes, value-chain stages or output
            groups.
          </p>
        </div>
      </section>

      <section id="guide-overview" className="howto-step howto-tab-section">
        <header>
          <div>
            <h2>Portfolio overview</h2>
            <p>
              Use this page for a quick view of portfolio size, timing, delivery
              status and geographic coverage.
            </p>
          </div>
        </header>
        <AnnotatedScreenshot
          src="overview-pipeline-status.png"
          alt="Project pipeline and delivery status"
          callouts={OVERVIEW_CALLOUTS}
        />
        <DefinitionGroups groups={OVERVIEW_DEFINITIONS} />
        <div className="howto-reading-guide">
          <p>
            Associated funding is the full reported value of the projects in
            the selection. Identified e-mobility funding includes only amounts
            that can be separated and attributed specifically to e-mobility, so
            it is presented as a minimum. The difference between the two should
            not be interpreted as non-e-mobility spending.
          </p>
          <p>
            The pipeline uses approval year, or expected approval year for
            proposed operations; it does not show annual disbursements. Delivery
            status shows the current recorded stage. Recipient economies counts
            distinct economies rather than projects.
          </p>
          <p>
            The geographic footprint maps reported project activity. Hover for
            the project, location type and funding details, or click a marker to
            select the project. Country-level points are used when no city,
            province, site or corridor is reported. Regional projects are
            mapped to participating countries where this information is
            available.
          </p>
        </div>
      </section>

      <section id="guide-funding" className="howto-step howto-tab-section">
        <header>
          <div>
            <h2>Funding &amp; geography</h2>
            <p>
              Use this page to compare funding over time, by project type,
              assistance type and recipient.
            </p>
          </div>
        </header>
        <AnnotatedScreenshot
          src="funding-charts.png"
          alt="Sovereign and nonsovereign trajectory and assistance mix"
          callouts={FUNDING_CALLOUTS}
        />
        <DefinitionGroups groups={FUNDING_DEFINITIONS} />
        <div className="howto-reading-guide">
          <p>
            Switch between Associated funding and Projects at the top of the
            page. Sovereign operations are government-backed; nonsovereign
            operations support private or other nonsovereign entities. When
            project counts are selected, one project may appear under more than
            one assistance type. Funding follows the recorded loan, grant and
            technical-assistance splits.
          </p>
          <p>
            Recipient ranking shows where the selected funding or projects are
            directed. Regional projects contribute to individual recipients
            when a country split was available. The identified e-mobility
            section repeats the analysis using only separately attributable
            e-mobility amounts and should be read as a documented minimum.
          </p>
        </div>
      </section>

      <section id="guide-technology" className="howto-step howto-tab-section">
        <header>
          <div>
            <h2>Technology profile</h2>
            <p>
              Use this page to examine what the projects support and where they
              sit in the e-mobility value chain.
            </p>
          </div>
        </header>
        <AnnotatedScreenshot
          src="technology-profile.png"
          alt="E-mobility subtheme coverage and project role"
          callouts={TECHNOLOGY_CALLOUTS}
        />
        <DefinitionGroups groups={TECHNOLOGY_DEFINITIONS} />
        <div className="howto-reading-guide">
          <p>
            The e-mobility role indicates how central e-mobility is to the
            project: Principal for a central objective, Partial for a defined
            component within a wider project, and Indirect for enabling support
            without a direct e-mobility investment. Each project has one role.
          </p>
          <p>
            Subthemes, vehicle and transport modes, value-chain stages and
            cross-cutting priorities are multi-label classifications based on
            the e-mobility content of the publicly available project data
            sheets. Their counts overlap and should not be added together.
            Sector distribution is different: it uses the single primary ADB
            sector reported for each project.
          </p>
          <p>
            Select a value-chain bar or Market and institutional enablers to
            open its definition and project list. In the cross-cutting-priority
            cloud, a larger term means it occurs in more projects; hover for the
            exact count.
          </p>
        </div>
      </section>

      <section id="guide-outputs" className="howto-step howto-tab-section">
        <header>
          <div>
            <h2>Outputs &amp; KPIs</h2>
            <p>
              Use this page to distinguish completed fleet delivery from the
              pipeline and to review other reported project outputs.
            </p>
          </div>
        </header>
        <AnnotatedScreenshot
          src="output-fleet-kpis.png"
          alt="Delivered fleet and fleet pipeline"
          callouts={OUTPUT_CALLOUTS}
        />
        <DefinitionGroups groups={OUTPUT_DEFINITIONS} />
        <div className="howto-reading-guide">
          <p>
            Delivered fleet includes only quantified vehicles reported as
            delivered, completed or operational and directly attributable to
            e-mobility. Fleet pipeline includes planned, approved, financed,
            under-procurement or proposed vehicles. These figures represent
            different stages and should not be combined as completed output.
          </p>
          <p>
            Output coverage counts projects reporting each output family; it
            does not total vehicles, chargers, policies or other units, and the
            categories overlap. Primary output profile instead assigns each
            project one category based on its most concrete reported or intended
            e-mobility result. Use View projects to inspect the records behind a
            total.
          </p>
        </div>
      </section>

      <section id="guide-projects" className="howto-step howto-tab-section">
        <header>
          <div>
            <h2>Project explorer</h2>
            <p>
              Use this page to check individual projects and download the
              filtered portfolio for further analysis.
            </p>
          </div>
        </header>
        <AnnotatedScreenshot
          src="project-explorer.png"
          alt="Project search, project table and workbook download"
          callouts={PROJECT_CALLOUTS}
        />
        <DefinitionGroups groups={PROJECT_DEFINITIONS} />
        <div className="howto-reading-guide">
          <p>
            Search works within the current portfolio filters. Select a project
            row to review its funding, recipients, sector, classifications,
            locations and reported outputs. The external-link button opens the
            official ADB project page. A blank identified funding amount means
            that no separate e-mobility amount was available; it does not mean
            that the project provides no e-mobility support.
          </p>
          <p>
            Project title, year, status, recipient, sector and other core fields
            come from ADB project information. E-mobility role, subthemes, mode,
            value-chain stage and cross-cutting priorities are dashboard
            classifications based on the publicly available project data sheet.
            Download workbook exports the filtered Projects, KPI, Recipient
            Funding and Modality Funding sheets.
          </p>
        </div>
      </section>
    </div>
  );
}

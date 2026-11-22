/*
  Official figures shown on the site. Each one was checked against the source
  beside it. To update a figure, change it here and nowhere else.
*/
window.POP_FACTS = {

  /* The crawl under the comments: figures from the weeks the threads ran. */
  then: [
    {
      text: "5,458,600 people were living in Ireland in April 2025",
      source: "Central Statistics Office",
      title: "Population and Migration Estimates, April 2025",
      url: "https://www.cso.ie/en/releasesandpublications/ep/p-pme/populationandmigrationestimatesapril2025/keyfindings"
    },
    {
      text: "The population grew by 78,300 in the year to April 2025",
      source: "Central Statistics Office",
      title: "Population and Migration Estimates, April 2025",
      url: "https://www.cso.ie/en/releasesandpublications/ep/p-pme/populationandmigrationestimatesapril2025/keyfindings"
    },
    {
      text: "16,766 people were living in emergency accommodation in October 2025",
      source: "Department of Housing",
      title: "Monthly homelessness report for October 2025, as reported by RTÉ",
      url: "https://www.rte.ie/news/ireland/2025/1128/1546360-homeless-figures"
    },
    {
      text: "5,274 of them were children, in 2,484 families",
      source: "Department of Housing",
      title: "Monthly homelessness report for October 2025, as reported by The Irish Times",
      url: "https://www.irishtimes.com/ireland/social-affairs/2025/11/28/number-of-homeless-people-in-ireland-reaches-new-record-high-in-october/"
    },
    {
      text: "716,573 people were on hospital waiting lists at the end of May 2025",
      source: "Department of Health",
      title: "Monthly waiting list figures, May 2025",
      url: "https://www.gov.ie/en/department-of-health/press-releases/monthly-waiting-list-figures-may-2025"
    },
    {
      text: "The unemployment rate was 4.9% in November 2025",
      source: "Central Statistics Office",
      title: "Monthly Unemployment, November 2025 (first estimate)",
      url: "https://www.cso.ie/en/releasesandpublications/ep/p-mue/monthlyunemploymentnovember2025"
    }
  ],

  /* Emergency accommodation, then and now. Used in the findings text. */
  emergency: {
    then: { month: "October 2025", total: 16766, children: 5274 },
    now: {
      month: "September 2026", total: 18065, children: 5897, yearBefore: 16614,
      source: "Department of Housing",
      title: "Monthly homelessness report for September 2026, as reported by the Irish Examiner",
      url: "https://www.irishexaminer.com/news/arid-41937555.html"
    }
  }
};

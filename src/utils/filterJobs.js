function matchesRating(ratingFilter, rating) {
  if (ratingFilter === 'All') {
    return true;
  }

  if (ratingFilter === '4.0+') {
    return rating >= 4.0;
  }

  if (ratingFilter === '4.5+') {
    return rating >= 4.5;
  }

  if (ratingFilter === '4.8+') {
    return rating >= 4.8;
  }

  return true;
}

export function filterJobs(jobs, filters) {
  const query = filters.search.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesSearch =
      !query ||
      job.name.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.primarySkill.toLowerCase().includes(query) ||
      job.skills.join(' ').toLowerCase().includes(query);

    const matchesDistrict =
      filters.district === 'All' || job.location.toLowerCase().includes(filters.district.toLowerCase());
    const matchesCategory = filters.category === 'All' || job.primarySkill === filters.category;
    const matchesAvailability =
      filters.availability === 'All' || job.availability === filters.availability;
    const ratingMatch = matchesRating(filters.rating, job.rating);

    return matchesSearch && matchesDistrict && matchesCategory && matchesAvailability && ratingMatch;
  });
}

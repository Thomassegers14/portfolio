import projectsData from '../assets/data/projects.json'
import skillsData from '../assets/data/skills.json'
import site from '../assets/data/site.json'

const skillNameById = Object.fromEntries(skillsData.map(s => [s.id, s.name]))

/**
 * All projects in display order: featured first (in configured order), then
 * the rest newest-first. Each project gets a running reference like "A—04".
 */
const featuredIds = site.work.featuredProjectIds
const featured = featuredIds.map(id => projectsData.find(p => p.id === id)).filter(Boolean)
const rest = projectsData
  .filter(p => !featuredIds.includes(p.id))
  .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title))

export const projects = [...featured, ...rest].map((p, i) => ({
  ...p,
  ref: `A—${String(i + 1).padStart(2, '0')}`,
  skills: p.skillIds.map(id => skillNameById[id]).filter(Boolean),
}))

export const featuredProjects = projects.slice(0, featured.length)
export const archiveProjects  = projects.slice(featured.length)

export const yearRange = (() => {
  const years = projects.map(p => p.year)
  return `${Math.min(...years)}—${Math.max(...years)}`
})()

export function projectById(id) {
  return projects.find(p => p.id === id)
}

/** Skills grouped by category, preserving the order in skills.json */
export const skillCategories = skillsData.reduce((groups, skill) => {
  let group = groups.find(g => g.category === skill.category)
  if (!group) {
    group = { category: skill.category, label: skill.categoryLabel, skills: [] }
    groups.push(group)
  }
  group.skills.push(skill.name)
  return groups
}, [])

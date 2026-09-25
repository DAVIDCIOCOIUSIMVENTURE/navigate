import { getCrumbs, hidesSidebarPath, isFocusFlowPath, type CrumbLookup } from "./root-layout-client"

describe("hidesSidebarPath", () => {
  it("drops the sidebar on the project page itself", () => {
    expect(hidesSidebarPath("/projects/12")).toBe(true)
    expect(hidesSidebarPath("/projects/12/")).toBe(true)
  })

  it("leaves it alone everywhere else", () => {
    expect(hidesSidebarPath("/")).toBe(false)
    expect(hidesSidebarPath("/projects")).toBe(false)
    expect(hidesSidebarPath("/projects/12/identify")).toBe(false)
    expect(hidesSidebarPath("/foundations")).toBe(false)
  })
})

describe("isFocusFlowPath", () => {
  it("keeps the app header on the project page itself", () => {
    expect(isFocusFlowPath("/projects/12")).toBe(false)
    expect(isFocusFlowPath("/projects/12/")).toBe(false)
  })

  it("hides the header and sidebar on every page under a project", () => {
    expect(isFocusFlowPath("/projects/12/identify")).toBe(true)
    expect(isFocusFlowPath("/projects/12/identify/canvas-builder")).toBe(true)
    expect(isFocusFlowPath("/projects/12/problem/edit")).toBe(true)
    expect(isFocusFlowPath("/projects/12/problem/explore/introduction")).toBe(true)
    expect(isFocusFlowPath("/projects/12/solutions/identify/pick-method")).toBe(true)
    expect(isFocusFlowPath("/projects/12/solutions/3")).toBe(true)
    expect(isFocusFlowPath("/projects/12/solutions/3/validate/verdict")).toBe(true)
    expect(isFocusFlowPath("/projects/12/solutions/compare/rate")).toBe(true)
  })

  it("hides them on Self Discovery and nowhere else", () => {
    expect(isFocusFlowPath("/self-discovery/discover")).toBe(true)
    expect(isFocusFlowPath("/self-discovery/discover/values/1")).toBe(true)
    expect(isFocusFlowPath("/self-discovery")).toBe(false)
    expect(isFocusFlowPath("/")).toBe(false)
    expect(isFocusFlowPath("/projects")).toBe(false)
    expect(isFocusFlowPath("/foundations")).toBe(false)
  })
})

describe("getCrumbs", () => {
  const lookup: CrumbLookup = {
    projectById: (id) => (id === 12 ? { label: "Rainy commutes", href: "/projects/12" } : null),
    projectForProblem: (problemId) => (problemId === 3 ? { label: "Rainy commutes", href: "/projects/12" } : null),
  }

  it("reads Home alone on the home page", () => {
    expect(getCrumbs("/", lookup)).toEqual([{ label: "Home" }])
  })

  it("puts the projects list under Home", () => {
    expect(getCrumbs("/projects", lookup)).toEqual([{ label: "Home", href: "/" }, { label: "Projects" }])
  })

  it("puts every project under the projects list", () => {
    expect(getCrumbs("/projects/12", lookup)).toEqual([
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Rainy commutes" },
    ])
    expect(getCrumbs("/projects/12/problem/explore/customer", lookup)).toEqual([
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Rainy commutes", href: "/projects/12" },
      { label: "Explore" },
    ])
  })

  it("names a project it cannot find", () => {
    expect(getCrumbs("/projects/99", lookup)).toEqual([
      { label: "Home", href: "/" },
      { label: "Projects", href: "/projects" },
      { label: "Project" },
    ])
  })
})

/**
 * Application route tree.
 *
 * Replaces Next's file-based App Router. The on-disk folder structure under
 * src/app/(app) is unchanged; this file is the single place that maps URLs to
 * those page modules. Next dynamic segments ([param]) become React Router
 * params (:param); each `layout.tsx` becomes a layout route that renders the
 * layout component around an <Outlet/>.
 */

import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom"
import RootLayoutClient from "@/app/root-layout-client"
import { RouteErrorBoundary } from "@/components/route-error-boundary"

// Dashboard + framework pages
import Dashboard from "@/app/(app)/page"
import NotFound from "@/app/(app)/not-found"

// Foundations
import FoundationsLayout from "@/app/(app)/foundations/layout"
import FoundationsIndex from "@/app/(app)/foundations/page"
import FoundationsSection from "@/app/(app)/foundations/[sectionUrl]/page"

// Self discovery
import SelfDiscoveryIndex from "@/app/(app)/self-discovery/page"
import SelfDiscoveryFlowLayout from "@/app/(app)/self-discovery/discover/layout"
import SelfDiscoveryDiscoverIndex from "@/app/(app)/self-discovery/discover/page"
import SelfDiscoveryOther from "@/app/(app)/self-discovery/discover/other/page"
import SelfDiscoveryCategory from "@/app/(app)/self-discovery/discover/[categoryId]/page"
import SelfDiscoveryQuestion from "@/app/(app)/self-discovery/discover/[categoryId]/[questionId]/page"

// Next steps
import NextStepsLayout from "@/app/(app)/next-steps/layout"
import NextStepsIndex from "@/app/(app)/next-steps/page"
import NextStepsTopic from "@/app/(app)/next-steps/[topicUrl]/page"

// Portfolio
import PortfolioIndex from "@/app/(app)/portfolio/page"
import PortfolioNew from "@/app/(app)/portfolio/new/page"
import PortfolioDetail from "@/app/(app)/portfolio/[portfolioId]/page"
import PortfolioEdit from "@/app/(app)/portfolio/[portfolioId]/edit/page"

// Problems
import ProblemsIndex from "@/app/(app)/problems/page"
import ProblemsIdentify from "@/app/(app)/problems/identify/page"
import CanvasBuilder from "@/app/(app)/problems/identify/canvas-builder/page"
import ReflectPage from "@/app/(app)/problems/identify/reflect/page"
import ResearchPage from "@/app/(app)/problems/identify/research/page"
import ProblemCanvas from "@/app/(app)/problems/[problemRef]/page"
import ProblemEdit from "@/app/(app)/problems/[problemRef]/edit/page"
import ExploreLayout from "@/app/(app)/problems/[problemRef]/explore/layout"
import ExploreIntroduction from "@/app/(app)/problems/[problemRef]/explore/introduction/page"
import ExploreCustomer from "@/app/(app)/problems/[problemRef]/explore/customer/page"
import ExploreChooseRefinement from "@/app/(app)/problems/[problemRef]/explore/choose-refinement/page"
import ExploreRefine from "@/app/(app)/problems/[problemRef]/explore/refine/page"
import ExploreExistingSolutions from "@/app/(app)/problems/[problemRef]/explore/existing-solutions/page"
import ExploreJobsToBeDone from "@/app/(app)/problems/[problemRef]/explore/jobs-to-be-done/page"
import ExploreSummary from "@/app/(app)/problems/[problemRef]/explore/summary/page"
import ValidationLayout from "@/app/(app)/problems/[problemRef]/validation/layout"
import ValidationIntroduction from "@/app/(app)/problems/[problemRef]/validation/introduction/page"
import ValidationWorth from "@/app/(app)/problems/[problemRef]/validation/worth/page"
import ValidationMarket from "@/app/(app)/problems/[problemRef]/validation/market/page"
import ValidationCompetition from "@/app/(app)/problems/[problemRef]/validation/competition/page"
import ValidationVerdict from "@/app/(app)/problems/[problemRef]/validation/verdict/page"
import ValidationSummary from "@/app/(app)/problems/[problemRef]/validation/summary/page"

// Solutions
import SolutionsIndex from "@/app/(app)/solutions/page"
import SolutionsIdentify from "@/app/(app)/solutions/identify/page"
import DiscoveryLayout from "@/app/(app)/solutions/discover/layout"
import DiscoverIndex from "@/app/(app)/solutions/discover/page"
import DiscoverIntroductionRedirect from "@/app/(app)/solutions/discover/introduction/page"
import DiscoverSelectProblem from "@/app/(app)/solutions/discover/select-problem/page"
import DiscoverChooseDiscovery from "@/app/(app)/solutions/discover/choose-discovery/page"
import DiscoverDiscover from "@/app/(app)/solutions/discover/discover/page"
import DiscoverSummary from "@/app/(app)/solutions/discover/summary/page"
import SolutionCanvas from "@/app/(app)/solutions/[solutionId]/page"
import SolutionEdit from "@/app/(app)/solutions/[solutionId]/edit/page"
import ValidateLayout from "@/app/(app)/solutions/[solutionId]/validate/layout"
import ValidateIndex from "@/app/(app)/solutions/[solutionId]/validate/page"
import ValidateIntroduction from "@/app/(app)/solutions/[solutionId]/validate/introduction/page"
import ValidateFeasibility from "@/app/(app)/solutions/[solutionId]/validate/feasibility/page"
import ValidateImpact from "@/app/(app)/solutions/[solutionId]/validate/impact/page"
import ValidateCost from "@/app/(app)/solutions/[solutionId]/validate/cost/page"
import ValidateTime from "@/app/(app)/solutions/[solutionId]/validate/time-to-implement/page"
import ValidateVerdict from "@/app/(app)/solutions/[solutionId]/validate/verdict/page"
import ValidateSummary from "@/app/(app)/solutions/[solutionId]/validate/summary/page"

// Settings
import SettingsLayout from "@/app/(app)/settings/layout"
import SettingsIndex from "@/app/(app)/settings/page"
import SettingsAccount from "@/app/(app)/settings/account/page"
import SettingsAppearance from "@/app/(app)/settings/appearance/page"
import SettingsNotifications from "@/app/(app)/settings/notifications/page"
import SettingsDataPrivacy from "@/app/(app)/settings/data-privacy/page"

// Admin
import AdminIndex from "@/app/(app)/admin/page"
import AdminUser from "@/app/(app)/admin/users/[userId]/page"

function AppLayout() {
  const { pathname } = useLocation()
  return (
    <RootLayoutClient>
      <RouteErrorBoundary resetKey={pathname}>
        <Outlet />
      </RouteErrorBoundary>
    </RootLayoutClient>
  )
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="foundations" element={<FoundationsLayout><Outlet /></FoundationsLayout>}>
          <Route index element={<FoundationsIndex />} />
          <Route path=":sectionUrl" element={<FoundationsSection />} />
        </Route>

        <Route path="self-discovery">
          <Route index element={<SelfDiscoveryIndex />} />
          <Route path="discover" element={<SelfDiscoveryFlowLayout><Outlet /></SelfDiscoveryFlowLayout>}>
            <Route index element={<SelfDiscoveryDiscoverIndex />} />
            <Route path="other" element={<SelfDiscoveryOther />} />
            <Route path=":categoryId">
              <Route index element={<SelfDiscoveryCategory />} />
              <Route path=":questionId" element={<SelfDiscoveryQuestion />} />
            </Route>
          </Route>
        </Route>

        <Route path="next-steps" element={<NextStepsLayout><Outlet /></NextStepsLayout>}>
          <Route index element={<NextStepsIndex />} />
          <Route path=":topicUrl" element={<NextStepsTopic />} />
        </Route>

        <Route path="portfolio">
          <Route index element={<PortfolioIndex />} />
          <Route path="new" element={<PortfolioNew />} />
          <Route path=":portfolioId">
            <Route index element={<PortfolioDetail />} />
            <Route path="edit" element={<PortfolioEdit />} />
          </Route>
        </Route>

        <Route path="problems">
          <Route index element={<ProblemsIndex />} />
          <Route path="identify">
            <Route index element={<ProblemsIdentify />} />
            <Route path="canvas-builder" element={<CanvasBuilder />} />
            <Route path="reflect" element={<ReflectPage />} />
            <Route path="research" element={<ResearchPage />} />
          </Route>
          <Route path=":problemRef">
            <Route index element={<ProblemCanvas />} />
            <Route path="edit" element={<ProblemEdit />} />
            <Route path="explore" element={<ExploreLayout><Outlet /></ExploreLayout>}>
              <Route index element={<Navigate to="introduction" replace />} />
              <Route path="introduction" element={<ExploreIntroduction />} />
              <Route path="customer" element={<ExploreCustomer />} />
              <Route path="choose-refinement" element={<ExploreChooseRefinement />} />
              <Route path="refine" element={<ExploreRefine />} />
              <Route path="existing-solutions" element={<ExploreExistingSolutions />} />
              <Route path="jobs-to-be-done" element={<ExploreJobsToBeDone />} />
              <Route path="summary" element={<ExploreSummary />} />
            </Route>
            <Route path="validation" element={<ValidationLayout><Outlet /></ValidationLayout>}>
              <Route index element={<Navigate to="introduction" replace />} />
              <Route path="introduction" element={<ValidationIntroduction />} />
              <Route path="worth" element={<ValidationWorth />} />
              <Route path="market" element={<ValidationMarket />} />
              <Route path="competition" element={<ValidationCompetition />} />
              <Route path="verdict" element={<ValidationVerdict />} />
              <Route path="summary" element={<ValidationSummary />} />
            </Route>
          </Route>
        </Route>

        <Route path="solutions">
          <Route index element={<SolutionsIndex />} />
          <Route path="identify" element={<SolutionsIdentify />} />
          <Route path="discover" element={<DiscoveryLayout><Outlet /></DiscoveryLayout>}>
            <Route index element={<DiscoverIndex />} />
            <Route path="introduction" element={<DiscoverIntroductionRedirect />} />
            <Route path="select-problem" element={<DiscoverSelectProblem />} />
            <Route path="choose-discovery" element={<DiscoverChooseDiscovery />} />
            <Route path="discover" element={<DiscoverDiscover />} />
            <Route path="summary" element={<DiscoverSummary />} />
          </Route>
          <Route path=":solutionId">
            <Route index element={<SolutionCanvas />} />
            <Route path="edit" element={<SolutionEdit />} />
            <Route path="validate" element={<ValidateLayout><Outlet /></ValidateLayout>}>
              <Route index element={<ValidateIndex />} />
              <Route path="introduction" element={<ValidateIntroduction />} />
              <Route path="feasibility" element={<ValidateFeasibility />} />
              <Route path="impact" element={<ValidateImpact />} />
              <Route path="cost" element={<ValidateCost />} />
              <Route path="time-to-implement" element={<ValidateTime />} />
              <Route path="verdict" element={<ValidateVerdict />} />
              <Route path="summary" element={<ValidateSummary />} />
            </Route>
          </Route>
        </Route>

        <Route path="settings" element={<SettingsLayout><Outlet /></SettingsLayout>}>
          <Route index element={<SettingsIndex />} />
          <Route path="account" element={<SettingsAccount />} />
          <Route path="appearance" element={<SettingsAppearance />} />
          <Route path="notifications" element={<SettingsNotifications />} />
          <Route path="data-privacy" element={<SettingsDataPrivacy />} />
        </Route>

        <Route path="admin">
          <Route index element={<AdminIndex />} />
          <Route path="users/:userId" element={<AdminUser />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

import {
    Accessibility,
    BarChart3,
    Baby,
    BookOpen,
    Brain,
    Briefcase,
    Building2,
    Clock,
    Code,
    Cog,
    Cpu,
    Crown,
    Dumbbell,
    Eye,
    Factory,
    Flame,
    Folder,
    Gamepad2,
    Gauge,
    Globe,
    GraduationCap,
    Handshake,
    Heart,
    HeartCrack,
    HeartHandshake,
    Landmark,
    LifeBuoy,
    Lock,
    MapPin,
    Megaphone,
    MessageSquare,
    Microscope,
    MousePointerClick,
    Network,
    Palette,
    PenLine,
    Plane,
    PoundSterling,
    Presentation,
    Route,
    Scale,
    ShieldAlert,
    ShieldCheck,
    ShoppingBag,
    Siren,
    Smartphone,
    Sparkles,
    Star,
    Store,
    Sunrise,
    Target,
    TreePine,
    TrendingUp,
    Trophy,
    User,
    Users,
    Utensils,
    Wrench,
    type LucideIcon,
} from "lucide-react"

/**
 * Icon lookup for collapsible catalogue group rows, shared by the self-discovery
 * suggestion tree and the Reflect pickers so the same category shows the same icon
 * wherever it appears. Rules are ordered: the first regex that matches the
 * lower-cased label wins, so the specific dimension / problem-type categories sit
 * ahead of the broader self-discovery themes.
 */
const GROUP_ICON_RULES: ReadonlyArray<readonly [RegExp, LucideIcon]> = [
    // Customer segment categories
    [/life stage/, Users],
    [/lifestyle/, Sparkles],
    [/small business|freelance/, Store],
    [/enterprise|corporate/, Building2],
    [/industry|vertical/, Factory],
    [/public & social|government|municipal/, Landmark],

    // Context categories
    [/routine/, Sunrise],
    [/life transition|transition/, Route],
    [/^environments?$/, MapPin],
    [/digital/, Smartphone],
    [/financial|money|budget/, PoundSterling],
    [/parenting|childcare/, Baby],
    [/emergenc|unexpected/, Siren],
    [/leisure|recreation/, Gamepad2],

    // Problem-type categories
    [/friction|usability/, MousePointerClick],
    [/knowledge/, BookOpen],
    [/trust|safety/, ShieldCheck],
    [/affordab|access/, Accessibility],
    [/coordination|alignment/, Network],
    [/performance|reliab/, Gauge],
    [/regulator|compliance/, Scale],
    [/timing|urgency/, Clock],
    [/switching|lock-in/, Lock],
    [/discovery|awareness/, Eye],
    [/support|service gap/, LifeBuoy],
    [/motivation|behaviour|behavior/, Flame],
    [/emotional|psychological|burden/, HeartCrack],

    // User-authored groups injected into the canvas and the pickers
    [/^your (items|custom items)$/, Star],

    // Skill, study and work-type categories
    [/self-management/, User],
    [/expertise/, Wrench],
    [/audience/, Megaphone],
    [/identity/, User],
    [/research|methodolog/, Microscope],
    [/reading|comprehension/, BookOpen],
    [/teaching|presenting/, Presentation],
    [/collaborat|cooperative|member organisation/, Handshake],
    [/customer-facing|retail|shopping/, ShoppingBag],
    [/non-profit|nonprofit|charity/, HeartHandshake],
    [/professional services/, Briefcase],
    [/humanities/, BookOpen],
    [/marketing/, TrendingUp],

    // Broader self-discovery themes
    [/software|programm|coding/, Code],
    [/data|analytic/, BarChart3],
    [/technical|hardware/, Cog],
    [/tech|science/, Cpu],
    [/writing/, PenLine],
    [/media|communicat/, MessageSquare],
    [/creative|art|design/, Palette],
    [/leadership|management/, Crown],
    [/strategy|analysis/, Target],
    [/thinking|problem/, Brain],
    [/sport|fitness|physical|hands-on|trade|practical/, Dumbbell],
    [/outdoor|nature|environment|climate/, TreePine],
    [/food|drink/, Utensils],
    [/travel/, Plane],
    [/education|learning|intellectual|growth/, GraduationCap],
    [/marketing/, TrendingUp],
    [/wellness|mindful|wellbeing|health/, Heart],
    [/family|relationship/, HeartHandshake],
    [/people|interpersonal/, Users],
    [/business|entrepreneur|career|work|finance|operations|economic|labour|economy/, Briefcase],
    [/adversity|challenge/, ShieldAlert],
    [/achievement|milestone/, Trophy],
    [/personal|identity|self-management/, User],
    [/humanities/, BookOpen],
    [/law|policy|rights|equality|justice|govern|freedom|expression/, Scale],
    [/global|geopolitical/, Globe],
    [/services|issue/, HeartHandshake],
    [/social|community/, Users],
]

export function getGroupIcon(label: string): LucideIcon {
    const l = label.toLowerCase()
    for (const [re, icon] of GROUP_ICON_RULES) {
        if (re.test(l)) return icon
    }
    return Folder
}

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Search,
  GitBranch,
  BarChart3,
  Layers,
  Code2,
  Keyboard,
} from "lucide-react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

const features = [
  {
    icon: <Code2 size={20} />,
    title: "Convert",
    description:
      "Prisma → SQL and SQL → Prisma with support for all operations, filters, relations, and aggregations.",
  },
  {
    icon: <Zap size={20} />,
    title: "Analyze",
    description:
      "Get performance scores, complexity ratings, and detect N+1 problems, missing indexes, and bottlenecks.",
  },
  {
    icon: <Search size={20} />,
    title: "Optimize",
    description:
      "Smart suggestions for pagination, field selection, query restructuring, and index recommendations.",
  },
  {
    icon: <Layers size={20} />,
    title: "AST Viewer",
    description:
      "Visualize your query structure as an interactive tree with expandable nodes.",
  },
  {
    icon: <GitBranch size={20} />,
    title: "History & Snippets",
    description:
      "Every conversion saved automatically. Organize snippets with tags and favorites.",
  },
  {
    icon: <BarChart3 size={20} />,
    title: "Examples Library",
    description:
      "25+ real-world examples covering CRUD, filtering, relations, pagination, and aggregation.",
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-56px)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Free &amp; Open Source
        </motion.div>

        <motion.h1
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
        >
          The Prisma //{" "}
          <span className="bg-linear-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent"></span>
        </motion.h1>

        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 max-w-xl text-lg text-slate-500 dark:text-slate-400"
        >
          Convert, analyze, optimize, and visualize your Prisma queries. Built
          for developers who care about performance.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-center gap-3"
        >
          <Link to="/converter">
            <Button size="lg">
              Open Converter
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Button variant="secondary" size="lg">
            <Keyboard size={16} />
            <span className="hidden sm:inline">Ctrl + Enter to convert</span>
          </Button>
        </motion.div>

        {/* Mini code preview */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 w-full max-w-2xl"
        >
          <Card className="overflow-hidden p-0 text-left">
            <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-2 text-xs text-slate-400">converter.ts</span>
            </div>
            <div className="grid grid-cols-1 divide-y divide-slate-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0 dark:divide-slate-700">
              <div className="p-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Prisma
                </p>
                <pre className="overflow-x-auto text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                  {`prisma.user.findMany({
  where: {
    role: "ADMIN",
    posts: {
      some: {
        published: true
      }
    }
  },
  include: {
    posts: true
  },
  take: 10
})`}
                </pre>
              </div>
              <div className="bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  SQL
                </p>
                <pre className="overflow-x-auto text-[13px] leading-relaxed text-slate-700 dark:text-slate-300">
                  {`SELECT "users".*,
  "posts".* 
FROM "users"
LEFT JOIN "posts" 
  ON "posts"."user_id" = "users"."id"
WHERE "users"."role" = 'ADMIN'
  AND EXISTS (
    SELECT 1 FROM "posts"
    WHERE "posts"."published" = TRUE
  )
LIMIT 10;`}
                </pre>
              </div>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-200 bg-white px-6 py-20 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <h2 className="text-2xl font-bold sm:text-3xl">
              Everything you need
            </h2>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              A complete toolkit for Prisma developers.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={fadeUp}>
                <Card className="h-full p-5 transition-shadow hover:shadow-md">
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
